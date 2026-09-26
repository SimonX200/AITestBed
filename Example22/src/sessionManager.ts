import http, { IncomingMessage, ServerResponse } from 'http';
import { createClient, RedisClientType } from 'redis';

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * Represents a user session with authentication token and expiration.
 * - id: Unique session identifier
 * - token: Authentication token for the session
 * - expiresAt: Timestamp when the session expires
 * - roles: Array of roles assigned to the user
 */
export interface UserSession {
  id: string;
  token: string;
  expiresAt: Date;
  roles: string[];
}

// =============================================================================
// Redis Key Constants
// =============================================================================

const SESSION_KEY_PREFIX = 'session:';
const TOKEN_INDEX_KEY = 'token_index';

// =============================================================================
// SessionManager Class
// =============================================================================

/**
 * Manages user sessions with Redis persistence.
 * 
 * Features:
 * - In-memory Map for fast lookups
 * - Redis for persistent storage
 * - Automatic cleanup of expired sessions
 * - HTTP API for session management
 * 
 * HTTP Endpoints:
 * - POST   /api/sessions          - Create a new session
 * - GET    /api/sessions/:id      - Get session by ID
 * - GET    /api/sessions/token/:token - Get session by token
 * - DELETE /api/sessions/:id      - Delete a session
 * - POST   /api/sessions/cleanup  - Manually trigger cleanup of expired sessions
 * - GET    /api/health            - Health check endpoint
 */
export class SessionManager {
  private sessions: Map<string, UserSession>;
  private redisClient: RedisClientType;
  private isRedisConnected: boolean;
  private cleanupInterval: NodeJS.Timeout | null;
  private readonly cleanupMs: number;

  constructor(redisUrl: string = 'redis://localhost:6379', cleanupIntervalMs: number = 60000) {
    this.sessions = new Map();
    this.isRedisConnected = false;
    this.cleanupInterval = null;
    this.cleanupMs = cleanupIntervalMs;

    // Initialize Redis client
    this.redisClient = createClient({ url: redisUrl, socket: { connectTimeout: 2000 } });
    this.redisClient.on('error', (err) => {
      console.error('Redis error:', err.message);
      this.isRedisConnected = false;
    });
    this.redisClient.on('connect', () => {
      console.log('Redis connected');
      this.isRedisConnected = true;
    });
    this.redisClient.on('close', () => {
      console.log('Redis connection closed');
      this.isRedisConnected = false;
    });

    // Connect to Redis
    this.connectRedis();
  }

  /**
   * Connect to Redis and load existing sessions.
   */
  private async connectRedis(): Promise<void> {
    // Use Promise.race to timeout the connection attempt
    const connectPromise = (async () => {
      await this.redisClient.connect();
      await this.loadSessionsFromRedis();
    })();
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2500));
    
    try {
      await Promise.race([connectPromise, timeoutPromise]);
      if (!this.isRedisConnected) {
        console.warn('Could not connect to Redis, running in memory-only mode');
      }
    } catch (error) {
      console.warn('Could not connect to Redis, running in memory-only mode:', error);
      this.isRedisConnected = false;
    }
  }

  /**
   * Load all sessions from Redis into memory.
   */
  private async loadSessionsFromRedis(): Promise<void> {
    if (!this.isRedisConnected) return;

    try {
      const keys = await this.redisClient.keys(`${SESSION_KEY_PREFIX}*`);
      for (const key of keys) {
        const data = await this.redisClient.get(key);
        if (data) {
          const session: UserSession = JSON.parse(data);
          session.expiresAt = new Date(session.expiresAt);
          this.sessions.set(session.id, session);
        }
      }
      console.log(`Loaded ${keys.length} sessions from Redis`);
    } catch (error) {
      console.error('Error loading sessions from Redis:', error);
    }
  }

  /**
   * Save a session to Redis.
   */
  private async saveSessionToRedis(session: UserSession): Promise<void> {
    if (!this.isRedisConnected) return;

    try {
      const data = JSON.stringify({
        ...session,
        expiresAt: session.expiresAt.toISOString(),
      });
      await this.redisClient.set(
        `${SESSION_KEY_PREFIX}${session.id}`,
        data,
        { EX: Math.ceil((session.expiresAt.getTime() - Date.now()) / 1000) }
      );
    } catch (error) {
      console.error('Error saving session to Redis:', error);
    }
  }

  /**
   * Remove a session from Redis.
   */
  private async removeSessionFromRedis(id: string): Promise<void> {
    if (!this.isRedisConnected) return;

    try {
      await this.redisClient.del(`${SESSION_KEY_PREFIX}${id}`);
    } catch (error) {
      console.error('Error removing session from Redis:', error);
    }
  }

  /**
   * Start the periodic cleanup of expired sessions.
   */
  startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.cleanupMs);
  }

  /**
   * Stop the periodic cleanup.
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Clean up all expired sessions from memory and Redis.
   * @returns Number of sessions removed
   */
  async cleanupExpiredSessions(): Promise<number> {
    const now = Date.now();
    const expiredIds: string[] = [];

    // Find expired sessions in memory
    for (const [id, session] of this.sessions) {
      if (session.expiresAt.getTime() <= now) {
        expiredIds.push(id);
      }
    }

    // Remove from memory and Redis
    for (const id of expiredIds) {
      this.sessions.delete(id);
      await this.removeSessionFromRedis(id);
    }

    if (expiredIds.length > 0) {
      console.log(`Cleaned up ${expiredIds.length} expired sessions`);
    }

    return expiredIds.length;
  }

  /**
   * Add a new session.
   * @param session - The session to add
   * @returns The added session
   */
  async addSession(session: UserSession): Promise<UserSession> {
    this.sessions.set(session.id, session);
    await this.saveSessionToRedis(session);
    return session;
  }

  /**
   * Check if a session exists and is not expired.
   * @param id - The session ID to check
   * @returns The session if valid, null otherwise
   */
  async checkSession(id: string): Promise<UserSession | null> {
    const session = this.sessions.get(id);
    if (!session) return null;
    if (session.expiresAt.getTime() <= Date.now()) {
      await this.removeSessionFromRedis(id);
      this.sessions.delete(id);
      return null;
    }
    return session;
  }

  /**
   * Get a session by ID (without expiration check).
   * @param id - The session ID
   * @returns The session or null
   */
  async getSession(id: string): Promise<UserSession | null> {
    return this.sessions.get(id) || null;
  }

  /**
   * Get all non-expired sessions.
   * @returns Array of valid sessions
   */
  async getAllSessions(): Promise<UserSession[]> {
    const now = Date.now();
    const valid: UserSession[] = [];
    for (const session of this.sessions.values()) {
      if (session.expiresAt.getTime() > now) {
        valid.push(session);
      }
    }
    return valid;
  }

  /**
   * Delete a session by ID.
   * @param id - The session ID to delete
   * @returns true if deleted, false if not found
   */
  async deleteSession(id: string): Promise<boolean> {
    const deleted = this.sessions.delete(id);
    await this.removeSessionFromRedis(id);
    return deleted;
  }

  /**
   * Get session count.
   * @returns Number of sessions in memory
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Get Redis connection status.
   * @returns true if Redis is connected
   */
  isConnected(): boolean {
    return this.isRedisConnected;
  }

  /**
   * Close the SessionManager and all connections.
   */
  async close(): Promise<void> {
    this.stopCleanup();
    if (this.isRedisConnected) {
      try {
        await this.redisClient.quit();
      } catch {
        // Ignore quit errors
      }
    }
  }
}

// =============================================================================
// HTTP Server Setup
// =============================================================================

/**
 * Parse URL path and extract route parameters.
 */
function parseRequest(req: IncomingMessage): { path: string; method: string; sessionId?: string; token?: string } {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const parts = url.pathname.split('/').filter(Boolean);
  
  let sessionId: string | undefined;
  let token: string | undefined;

  if (parts[0] === 'api' && parts[1] === 'sessions') {
    if (parts[2] === 'token' && parts[3]) {
      token = parts[3];
    } else if (parts[2]) {
      sessionId = parts[2];
    }
  }

  return { path: url.pathname, method: req.method || 'GET', sessionId, token };
}

/**
 * Send a JSON response.
 */
function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

/**
 * Read request body as string.
 */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

/**
 * Create and start the HTTP server with SessionManager.
 * @param sessionManager - The SessionManager instance
 * @param port - Port to listen on
 * @returns The HTTP server instance
 */
export function createServer(sessionManager: SessionManager, port: number): http.Server {
  const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const { method, path, sessionId, token } = parseRequest(req);

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      // Health check
      if (path === '/api/health') {
        return sendJson(res, 200, {
          status: 'ok',
          redisConnected: sessionManager.isConnected(),
          sessionCount: sessionManager.getSessionCount(),
          timestamp: new Date().toISOString(),
        });
      }

      // POST /api/sessions - Create session
      if (method === 'POST' && path === '/api/sessions') {
        const body = await readBody(req);
        let data: { id?: string; token: string; roles?: string[]; expiresIn?: number };
        try {
          data = JSON.parse(body);
        } catch {
          return sendJson(res, 400, { error: 'Invalid JSON body' });
        }

        if (!data.token) {
          return sendJson(res, 400, { error: 'Token is required' });
        }

        const id = data.id || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const expiresIn = data.expiresIn || 3600; // Default 1 hour
        const expiresAt = new Date(Date.now() + expiresIn * 1000);

        const session: UserSession = {
          id,
          token: data.token,
          expiresAt,
          roles: data.roles || [],
        };

        await sessionManager.addSession(session);
        return sendJson(res, 201, session);
      }

      // GET /api/sessions - List all sessions
      if (method === 'GET' && path === '/api/sessions') {
        const sessions = await sessionManager.getAllSessions();
        return sendJson(res, 200, { sessions, count: sessions.length });
      }

      // GET /api/sessions/:id - Get session by ID
      if (method === 'GET' && sessionId) {
        const session = await sessionManager.checkSession(sessionId);
        if (!session) {
          return sendJson(res, 404, { error: 'Session not found or expired' });
        }
        return sendJson(res, 200, session);
      }

      // GET /api/sessions/token/:token - Get session by token
      if (method === 'GET' && token) {
        const sessions = await sessionManager.getAllSessions();
        const found = sessions.find((s) => s.token === token);
        if (!found) {
          return sendJson(res, 404, { error: 'Session not found for token' });
        }
        return sendJson(res, 200, found);
      }

      // DELETE /api/sessions/:id - Delete session
      if (method === 'DELETE' && sessionId) {
        const deleted = await sessionManager.deleteSession(sessionId);
        if (!deleted) {
          return sendJson(res, 404, { error: 'Session not found' });
        }
        return sendJson(res, 200, { message: 'Session deleted', id: sessionId });
      }

      // POST /api/sessions/cleanup - Trigger cleanup
      if (method === 'POST' && path === '/api/sessions/cleanup') {
        const removed = await sessionManager.cleanupExpiredSessions();
        return sendJson(res, 200, { message: 'Cleanup completed', removed });
      }

      // 404 for unknown routes
      return sendJson(res, 404, { error: 'Not found', path });
    } catch (error) {
      console.error('Server error:', error);
      return sendJson(res, 500, { error: 'Internal server error' });
    }
  });

  return server;
}

// =============================================================================
// Main Entry Point
// =============================================================================

/**
 * Start the SessionManager HTTP server.
 */
async function main(): Promise<void> {
  const port = parseInt(process.env.PORT || '3000', 10);
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  const sessionManager = new SessionManager(redisUrl);
  const server = createServer(sessionManager, port);

  sessionManager.startCleanup();

  server.listen(port, () => {
    console.log(`SessionManager server running on port ${port}`);
    console.log(`Redis connected: ${sessionManager.isConnected()}`);
    console.log(`Health check: http://localhost:${port}/api/health`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down...`);
    sessionManager.stopCleanup();
    await sessionManager.close();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Run if executed directly (not when imported as module)
if (require.main === module) {
  main().catch(console.error);
}
