import express, { Request, Response } from 'express';
import * as crypto from 'crypto';

// ============================================================
// SessionManager - HTTP API for user session management
// ============================================================
// This module provides a RESTful API for managing user sessions
// with persistent storage via Redis.
//
// Features:
//   - Create, retrieve, validate, and delete user sessions
//   - Automatic cleanup of expired sessions
//   - Role-based access control
//   - Redis-backed persistent storage
//
// Class Diagram:
//   +-------------------+
//   |   SessionManager  |
//   +-------------------+
//   - redisClient: Redis
//   - inMemoryMap: Map<string, UserSession>
//   +-------------------+
//   | +createSession(): Promise<UserSession>
//   | +getSession(id): Promise<UserSession | null>
//   | +validateSession(id, token): Promise<boolean>
//   | +deleteSession(id): Promise<boolean>
//   | +cleanupExpired(): Promise<number>
//   | +getAllSessions(): Promise<UserSession[]>
//   +-------------------+
//           |
//           | uses
//           v
//   +-------------------+
//   |    UserSession    |
//   +-------------------+
//   - id: string
//   - token: string
//   - expiresAt: Date
//   - roles: string[]
//   +-------------------+
//           |
//           | persists to
//           v
//   +-------------------+
//   |      Redis        |
//   +-------------------+
//   | - sessions:{id}   |
//   | - session:ids     |
//   +-------------------+

export interface UserSession {
  id: string;
  token: string;
  expiresAt: Date;
  roles: string[];
}

export interface SessionData {
  id: string;
  token: string;
  expiresAt: string;
  roles: string[];
}

export interface CreateSessionInput {
  userId: string;
  roles?: string[];
  durationMinutes?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * SessionManager handles session lifecycle with Redis persistence.
 * Uses an in-memory Map for fast lookups and Redis for durability.
 */
export class SessionManager {
  private redisClient: any;
  private inMemoryMap: Map<string, UserSession>;
  private readonly defaultDurationMinutes: number = 60;

  constructor(redisUrl: string = 'redis://localhost:6379') {
    this.inMemoryMap = new Map();
    this.connectRedis(redisUrl);
  }

  /**
   * Connect to Redis database for persistent storage.
   */
  private async connectRedis(redisUrl: string): Promise<void> {
    try {
      const redis = await import('ioredis');
      this.redisClient = new redis.default(redisUrl);
      await this.redisClient.ping();
      console.log('Connected to Redis at', redisUrl);
    } catch (error) {
      console.warn('Redis connection failed, using in-memory only:', error);
      this.redisClient = null;
    }
  }

  /**
   * Generate a cryptographically secure session ID and token.
   */
  private generateId(): string {
    return crypto.randomUUID();
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Serialize UserSession for Redis storage.
   */
  private serialize(session: UserSession): SessionData {
    return {
      id: session.id,
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
      roles: session.roles,
    };
  }

  /**
   * Deserialize SessionData from Redis into UserSession.
   */
  private deserialize(data: SessionData): UserSession {
    return {
      id: data.id,
      token: data.token,
      expiresAt: new Date(data.expiresAt),
      roles: data.roles,
    };
  }

  /**
   * Create a new user session with optional roles and duration.
   * @param input - Session creation parameters
   * @returns The created UserSession
   */
  async createSession(input: CreateSessionInput): Promise<UserSession> {
    const id = this.generateId();
    const token = this.generateToken();
    const duration = input.durationMinutes || this.defaultDurationMinutes;
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);
    const roles = input.roles || ['user'];

    const session: UserSession = { id, token, expiresAt, roles };
    this.inMemoryMap.set(id, session);

    if (this.redisClient) {
      await this.redisClient.set(
        `session:${id}`,
        JSON.stringify(this.serialize(session))
      );
      await this.redisClient.sadd('session:ids', id);
    }
    return session;
  }

  /**
   * Retrieve a session by its ID.
   * @param id - Session ID
   * @returns UserSession or null if not found/expired
   */
  async getSession(id: string): Promise<UserSession | null> {
    const cached = this.inMemoryMap.get(id);
    if (cached) {
      if (!this.isExpired(cached)) return cached;
    }
    if (this.redisClient) {
      const data = await this.redisClient.get(`session:${id}`);
      if (data) {
        const session = this.deserialize(JSON.parse(data));
        this.inMemoryMap.set(id, session);
        if (!this.isExpired(session)) return session;
      }
    }
    return null;
  }

  /**
   * Validate if a session exists and is not expired.
   * @param id - Session ID
   * @param token - Session token for verification
   * @returns true if valid
   */
  async validateSession(id: string, token: string): Promise<boolean> {
    const session = await this.getSession(id);
    return session !== null && session.token === token && !this.isExpired(session);
  }

  /**
   * Delete a session by its ID.
   * @param id - Session ID
   * @returns true if deleted
   */
  async deleteSession(id: string): Promise<boolean> {
    const deleted = this.inMemoryMap.delete(id);
    if (this.redisClient) {
      await this.redisClient.del(`session:${id}`);
      await this.redisClient.srem('session:ids', id);
    }
    return deleted;
  }

  /**
   * Remove all expired sessions from memory and Redis.
   * @returns Number of sessions cleaned up
   */
  async cleanupExpired(): Promise<number> {
    let count = 0;
    for (const [id, session] of this.inMemoryMap) {
      if (this.isExpired(session)) {
        this.inMemoryMap.delete(id);
        count++;
      }
    }
    if (this.redisClient) {
      const ids = await this.redisClient.smembers('session:ids');
      for (const id of ids) {
        const data = await this.redisClient.get(`session:${id}`);
        if (data) {
          const session = this.deserialize(JSON.parse(data));
          if (this.isExpired(session)) {
            await this.redisClient.del(`session:${id}`);
            await this.redisClient.srem('session:ids', id);
            count++;
          }
        }
      }
    }
    return count;
  }

  /**
   * Get all active (non-expired) sessions.
   * @returns Array of active UserSessions
   */
  async getAllSessions(): Promise<UserSession[]> {
    const sessions: UserSession[] = [];
    for (const session of this.inMemoryMap.values()) {
      if (!this.isExpired(session)) sessions.push(session);
    }
    if (this.redisClient) {
      const ids = await this.redisClient.smembers('session:ids');
      for (const id of ids) {
        const data = await this.redisClient.get(`session:${id}`);
        if (data) {
          const session = this.deserialize(JSON.parse(data));
          if (!this.isExpired(session)) sessions.push(session);
        }
      }
    }
    return sessions;
  }

  /**
   * Check if a session has expired.
   */
  private isExpired(session: UserSession): boolean {
    return new Date() > session.expiresAt;
  }

  /**
   * Gracefully close Redis connection.
   */
  async close(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}

/**
 * Create and configure the Express application with SessionManager.
 * @param sessionManager - SessionManager instance
 * @returns Configured Express application
 */
export function createApp(sessionManager: SessionManager): express.Application {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Create session endpoint
  app.post('/api/sessions', async (req: Request, res: Response) => {
    try {
      const { userId, roles, durationMinutes } = req.body;
      if (!userId) {
        res.status(400).json({ success: false, error: 'userId is required' });
        return;
      }
      const session = await sessionManager.createSession({ userId, roles, durationMinutes });
      res.status(201).json({ success: true, data: session });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Get session endpoint
  app.get('/api/sessions/:id', async (req: Request, res: Response) => {
    try {
      const session = await sessionManager.getSession(req.params.id as string);
      if (!session) {
        res.status(404).json({ success: false, error: 'Session not found' });
        return;
      }
      res.json({ success: true, data: session });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Validate session endpoint
  app.post('/api/sessions/:id/validate', async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(400).json({ success: false, error: 'token is required' });
        return;
      }
      const valid = await sessionManager.validateSession(req.params.id as string, token);
      res.json({ success: true, data: { valid } });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Delete session endpoint
  app.delete('/api/sessions/:id', async (req: Request, res: Response) => {
    try {
      const deleted = await sessionManager.deleteSession(req.params.id as string);
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Session not found' });
        return;
      }
      res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Cleanup expired sessions endpoint
  app.post('/api/sessions/cleanup', async (_req: Request, res: Response) => {
    try {
      const count = await sessionManager.cleanupExpired();
      res.json({ success: true, data: { cleanedUp: count } });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Get all sessions endpoint
  app.get('/api/sessions', async (_req: Request, res: Response) => {
    try {
      const sessions = await sessionManager.getAllSessions();
      res.json({ success: true, data: sessions });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  return app;
}

/**
 * Start the HTTP server.
 */
function main(): void {
  const port = parseInt(process.env.EXAMPLE_SESSIONMANAGER_PORT || '3000', 10);
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const sessionManager = new SessionManager(redisUrl);
  const app = createApp(sessionManager);
  const server = app.listen(port, () => {
    console.log(`SessionManager API running on port ${port}`);
  });
  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    await sessionManager.close();
    server.close(() => { console.log('Server closed'); process.exit(0); });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

if (require.main === module) {
  main();
}

export default SessionManager;
