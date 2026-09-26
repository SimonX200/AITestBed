import express, { Request, Response } from 'express';
import Redis from 'ioredis';

// ─── Type Definitions ───────────────────────────────────────────────────────

/**
 * Represents a user session with its metadata.
 */
interface UserSession {
  id: string;
  token: string;
  expiresAt: Date;
  roles: string[];
}

/**
 * Result of a session operation.
 */
interface SessionResult {
  success: boolean;
  session?: UserSession;
  error?: string;
}

// ─── Redis Storage Adapter ──────────────────────────────────────────────────

/**
 * Handles persistent storage of sessions using Redis.
 * Redis is chosen for its native TTL support, in-memory performance,
 * and suitability for session management use cases.
 */
class RedisStorage {
  private redis: Redis;
  private connected: boolean;

  /**
   * Creates a new Redis storage adapter.
   * @param url - Redis connection URL. Defaults to 'redis://localhost:6379/0'.
   */
  constructor(url: string = 'redis://localhost:6379/0') {
    this.redis = new Redis(url);
    this.connected = false;
  }

  /**
   * Initializes the Redis connection.
   */
  async init(): Promise<void> {
    if (this.connected) return;
    await this.redis.ping();
    this.connected = true;
  }

  /**
   * Inserts or updates a session in Redis with automatic TTL.
   */
  async save(session: UserSession): Promise<void> {
    const ttl = Math.max(1, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000));
    
    // Store session data
    await this.redis.setex(
      `session:${session.id}`,
      ttl,
      JSON.stringify(session)
    );
    
    // Index by token for fast lookups
    await this.redis.setex(
      `token:${session.token}`,
      ttl,
      session.id
    );
  }

  /**
   * Retrieves a session by its ID.
   */
  async findById(id: string): Promise<UserSession | null> {
    const data = await this.redis.get(`session:${id}`);
    if (!data) return null;
    const session = JSON.parse(data);
    session.expiresAt = new Date(session.expiresAt);
    return session;
  }

  /**
   * Retrieves a session by its token.
   */
  async findByToken(token: string): Promise<UserSession | null> {
    const sessionId = await this.redis.get(`token:${token}`);
    return sessionId ? this.findById(sessionId) : null;
  }

  /**
   * Returns all sessions (note: inefficient for large datasets,
   * use SCAN in production).
   */
  async findAll(): Promise<UserSession[]> {
    const keys = await this.redis.keys('session:*');
    const sessions: UserSession[] = [];
    
    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        // Convert expiresAt back to Date
        session.expiresAt = new Date(session.expiresAt);
        sessions.push(session);
      }
    }
    
    return sessions;
  }

  /**
   * Deletes a session by its ID.
   * @returns true if a session was deleted.
   */
  async deleteById(id: string): Promise<boolean> {
    const session = await this.findById(id);
    if (!session) return false;
    
    const multi = this.redis.multi();
    multi.del(`session:${id}`);
    multi.del(`token:${session.token}`);
    await multi.exec();
    
    return true;
  }

  /**
   * Removes all expired sessions.
   * Note: Redis handles expiration automatically, so this is a no-op.
   * @returns 0 (Redis auto-cleanup)
   */
  async cleanupExpired(): Promise<number> {
    // Redis automatically expires keys - no manual cleanup needed
    return 0;
  }

  /**
   * Checks if a session exists and is not expired.
   */
  async existsAndValid(id: string): Promise<boolean> {
    const session = await this.findById(id);
    return session !== null && session.expiresAt.getTime() > Date.now();
  }

  /**
   * Returns the number of active sessions.
   */
  async count(): Promise<number> {
    const keys = await this.redis.keys('session:*');
    return keys.length;
  }

  /**
   * Closes the Redis connection.
   */
  async close(): Promise<void> {
    if (!this.connected) return;
    try {
      await this.redis.quit();
    } catch {
      // Connection already closed or error during quit - ignore
    }
    this.connected = false;
  }
}

// ─── Session Manager ────────────────────────────────────────────────────────

/**
 * Manages user sessions with in-memory caching and persistent Redis storage.
 *
 * Features:
 * - In-memory Map for fast lookups
 * - Persistent storage via Redis with automatic TTL
 * - Automatic expiration cleanup (handled by Redis)
 * - HTTP API endpoints via Express
 *
 * @example
 * const manager = new SessionManager();
 * await manager.init();
 * manager.createSession('user1', ['admin', 'user']);
 * const session = manager.getSession('session-id');
 */
class SessionManager {
  private sessions: Map<string, UserSession>;
  private storage: RedisStorage;
  private app: express.Application;
  private redisUrl: string;
  private _initialized: boolean;
  private shouldLoadFromDisk: boolean;

  /**
   * Creates a new SessionManager instance.
   * @param options - Configuration options.
   * @param options.redisUrl - Redis connection URL. Defaults to 'redis://localhost:6379/0'.
   * @param options.loadFromDisk - Whether to load existing sessions from Redis on startup. Defaults to true.
   */
  constructor(options?: { redisUrl?: string; loadFromDisk?: boolean }) {
    this.redisUrl = options?.redisUrl || process.env.REDIS_URL || 'redis://localhost:6379/0';
    this.shouldLoadFromDisk = options?.loadFromDisk !== false;
    this.sessions = new Map();
    this.storage = new RedisStorage(this.redisUrl);
    this._initialized = false;
    this.app = express();
    this.configureMiddleware();
    this.setupRoutes();
  }

  /**
   * Initializes the session manager (loads from Redis).
   */
  async init(): Promise<void> {
    if (this._initialized) return;
    await this.storage.init();
    if (this.shouldLoadFromDisk) {
      await this.loadFromDisk();
    }
    this._initialized = true;
  }

  /**
   * Loads all sessions from Redis into the in-memory Map.
   */
  private async loadFromDisk(): Promise<void> {
    const sessions = await this.storage.findAll();
    for (const session of sessions) {
      this.sessions.set(session.id, session);
    }
  }

  /**
   * Persists a session to Redis.
   */
  private async persist(session: UserSession): Promise<void> {
    await this.storage.save(session);
  }

  /**
   * Configures Express middleware.
   */
  private configureMiddleware(): void {
    this.app.use(express.json());
  }

  /**
   * Sets up all HTTP API routes.
   */
  private setupRoutes(): void {
    this.app.post('/api/sessions', async (req: Request, res: Response) => {
      try {
        const { userId, roles, expiresInHours = 1 } = req.body;
        if (!userId) {
          res.status(400).json({ success: false, error: 'userId is required' });
          return;
        }
        const session = await this.createSession(userId, roles || [], expiresInHours);
        res.status(201).json({ success: true, data: this.sessionToResponse(session) });
      } catch (err) {
        res.status(500).json({ success: false, error: (err as Error).message });
      }
    });

    this.app.get('/api/sessions/:id', async (req: Request, res: Response) => {
      try {
        const session = this.getSession(req.params.id);
        if (!session) {
          res.status(404).json({ success: false, error: 'Session not found' });
          return;
        }
        if (session.expiresAt.getTime() <= Date.now()) {
          res.status(401).json({ success: false, error: 'Session expired' });
          return;
        }
        res.json({ success: true, data: this.sessionToResponse(session) });
      } catch (err) {
        res.status(500).json({ success: false, error: (err as Error).message });
      }
    });

    this.app.get('/api/sessions/token/:token', async (req: Request, res: Response) => {
      try {
        const session = this.getSessionByToken(req.params.token);
        if (!session) {
          res.status(404).json({ success: false, error: 'Session not found' });
          return;
        }
        if (session.expiresAt.getTime() <= Date.now()) {
          res.status(401).json({ success: false, error: 'Session expired' });
          return;
        }
        res.json({ success: true, data: this.sessionToResponse(session) });
      } catch (err) {
        res.status(500).json({ success: false, error: (err as Error).message });
      }
    });

    this.app.get('/api/sessions', (_req: Request, res: Response) => {
      try {
        const sessions = this.listSessions();
        res.json({ success: true, data: sessions.map((s) => this.sessionToResponse(s)) });
      } catch (err) {
        res.status(500).json({ success: false, error: (err as Error).message });
      }
    });

    this.app.delete('/api/sessions/:id', async (req: Request, res: Response) => {
      try {
        const deleted = await this.deleteSession(req.params.id);
        if (!deleted) {
          res.status(404).json({ success: false, error: 'Session not found' });
          return;
        }
        res.json({ success: true, data: { deleted: req.params.id } });
      } catch (err) {
        res.status(500).json({ success: false, error: (err as Error).message });
      }
    });

    this.app.post('/api/sessions/cleanup', async (_req: Request, res: Response) => {
      try {
        const removed = await this.cleanupExpiredSessions();
        res.json({ success: true, data: { removed } });
      } catch (err) {
        res.status(500).json({ success: false, error: (err as Error).message });
      }
    });

    this.app.get('/api/health', (_req: Request, res: Response) => {
      res.json({
        success: true,
        data: {
          status: 'ok',
          activeSessions: this.sessions.size,
          timestamp: new Date().toISOString(),
        },
      });
    });
  }

  private sessionToResponse(session: UserSession): Record<string, unknown> {
    return {
      id: session.id,
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
      roles: session.roles,
    };
  }

  // ─── Public Session Management Methods ──────────────────────────────────

  /**
   * Creates a new session for the given user.
   * @param userId - The unique identifier of the user.
   * @param roles - List of roles assigned to the session.
   * @param expiresInHours - Hours until the session expires. Defaults to 1.
   * @returns The created UserSession.
   */
  async createSession(userId: string, roles: string[] = [], expiresInHours: number = 1): Promise<UserSession> {
    const id = this.generateId();
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    const session: UserSession = { id, token, expiresAt, roles };
    this.sessions.set(id, session);
    await this.persist(session);
    return session;
  }

  /**
   * Retrieves a session by its ID.
   */
  getSession(id: string): UserSession | null {
    return this.sessions.get(id) || null;
  }

  /**
   * Retrieves a session by its token.
   */
  getSessionByToken(token: string): UserSession | null {
    for (const session of this.sessions.values()) {
      if (session.token === token) return session;
    }
    return null;
  }

  /**
   * Checks if a session is valid (exists and not expired).
   */
  isValid(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
    return session.expiresAt.getTime() > Date.now();
  }

  /**
   * Lists all non-expired sessions.
   */
  listSessions(): UserSession[] {
    const now = Date.now();
    const result: UserSession[] = [];
    for (const session of this.sessions.values()) {
      if (session.expiresAt.getTime() > now) result.push(session);
    }
    return result;
  }

  /**
   * Deletes a session by its ID.
   */
  async deleteSession(id: string): Promise<boolean> {
    const deleted = this.sessions.delete(id);
    await this.storage.deleteById(id);
    return deleted;
  }

  /**
   * Removes all expired sessions from both memory and storage.
   * Note: Redis handles expiration automatically, so this mainly syncs memory.
   */
  async cleanupExpiredSessions(): Promise<number> {
    const now = Date.now();
    const idsToRemove: string[] = [];
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt.getTime() <= now) idsToRemove.push(id);
    }
    for (const id of idsToRemove) {
      this.sessions.delete(id);
      await this.storage.deleteById(id);
    }
    return idsToRemove.length;
  }

  /**
   * Returns the Express application instance for HTTP serving.
   */
  getApp(): express.Application {
    return this.app;
  }

  /**
   * Starts the HTTP server on the given port.
   */
  async startServer(port: number): Promise<express.Application> {
    return new Promise((resolve, reject) => {
      const server = this.app.listen(port, () => {
        resolve(this.app);
      });
      server.on('error', reject);
    });
  }

  /**
   * Closes the Redis connection and cleans up resources.
   */
  async dispose(): Promise<void> {
    await this.storage.close();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}

// ─── CLI / Entry Point ──────────────────────────────────────────────────────

const PORT = parseInt(process.env.EXAMPLE_SESSIONMANAGER_PORT || process.env.PORT || '3000', 10);

async function main(): Promise<void> {
  const manager = new SessionManager({ loadFromDisk: true });
  await manager.init();
  await manager.startServer(PORT);
  console.log(`SessionManager running on port ${PORT}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Failed to start SessionManager:', err);
    process.exit(1);
  });
}

export { SessionManager, RedisStorage, UserSession, SessionResult };
