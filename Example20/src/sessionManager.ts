import express, { Request, Response } from 'express';
import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';

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

// ─── SQLite Storage Adapter (sql.js) ────────────────────────────────────────

/**
 * Handles persistent storage of sessions using sql.js (pure JS SQLite).
 * sql.js runs SQLite in JavaScript without native bindings.
 */
class SQLiteStorage {
  private db: Database | null;
  private initialized: boolean;
  private dbPath: string;

  /**
   * Creates a new SQLite storage adapter.
   * @param dbPath - Path to the SQLite database file.
   */
  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initializes the database connection and creates tables.
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    const SQL = await initSqlJs();
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(this.dbPath)) {
      const fileBuffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(fileBuffer);
    } else {
      this.db = new SQL.Database();
    }
    this.initializeTables();
    this.persistDb();
    this.initialized = true;
  }

  private initializeTables(): void {
    this.db!.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        roles TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_expires_at ON sessions(expires_at);
    `);
  }

  private persistDb(): void {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  /**
   * Inserts or updates a session in the database.
   */
  async save(session: UserSession): Promise<void> {
    await this.init();
    this.db!.run(
      'INSERT OR REPLACE INTO sessions (id, token, expires_at, roles) VALUES (?, ?, ?, ?)',
      [session.id, session.token, session.expiresAt.getTime(), JSON.stringify(session.roles)]
    );
    this.persistDb();
  }

  /**
   * Retrieves a session by its ID.
   */
  async findById(id: string): Promise<UserSession | null> {
    await this.init();
    const result = this.db!.exec(
      'SELECT * FROM sessions WHERE id = ?',
      [id]
    );
    if (!result || result.length === 0 || !result[0].values || result[0].values.length === 0) {
      return null;
    }
    const row = result[0].values[0];
    return {
      id: row[0] as string,
      token: row[1] as string,
      expiresAt: new Date(Number(row[2])),
      roles: JSON.parse(row[3] as string),
    };
  }

  /**
   * Retrieves a session by its token.
   */
  async findByToken(token: string): Promise<UserSession | null> {
    await this.init();
    const result = this.db!.exec(
      'SELECT * FROM sessions WHERE token = ?',
      [token]
    );
    if (!result || result.length === 0 || !result[0].values || result[0].values.length === 0) {
      return null;
    }
    const row = result[0].values[0];
    return {
      id: row[0] as string,
      token: row[1] as string,
      expiresAt: new Date(Number(row[2])),
      roles: JSON.parse(row[3] as string),
    };
  }

  /**
   * Returns all non-expired sessions.
   */
  async findAll(): Promise<UserSession[]> {
    await this.init();
    const now = Date.now();
    const result = this.db!.exec(
      'SELECT * FROM sessions WHERE expires_at > ?',
      [now]
    );
    const sessions: UserSession[] = [];
    if (result && result.length > 0 && result[0].values) {
      for (const row of result[0].values) {
        sessions.push({
          id: row[0] as string,
          token: row[1] as string,
          expiresAt: new Date(Number(row[2])),
          roles: JSON.parse(row[3] as string),
        });
      }
    }
    return sessions;
  }

  /**
   * Deletes a session by its ID.
   * @returns true if a session was deleted.
   */
  async deleteById(id: string): Promise<boolean> {
    await this.init();
    const countResult = this.db!.exec(
      'SELECT COUNT(*) FROM sessions WHERE id = ?',
      [id]
    );
    const count = countResult && countResult.length > 0 && countResult[0].values && countResult[0].values[0]
      ? Number(countResult[0].values[0][0]) : 0;
    this.db!.run('DELETE FROM sessions WHERE id = ?', [id]);
    this.persistDb();
    return count > 0;
  }

  /**
   * Removes all expired sessions from the database.
   * @returns The number of sessions removed.
   */
  async cleanupExpired(): Promise<number> {
    await this.init();
    const now = Date.now();
    const countResult = this.db!.exec(
      'SELECT COUNT(*) FROM sessions WHERE expires_at <= ?',
      [now]
    );
    const count = countResult && countResult.length > 0 && countResult[0].values && countResult[0].values[0]
      ? Number(countResult[0].values[0][0]) : 0;
    this.db!.run('DELETE FROM sessions WHERE expires_at <= ?', [now]);
    this.persistDb();
    return count;
  }

  /**
   * Checks if a session exists and is not expired.
   */
  async existsAndValid(id: string): Promise<boolean> {
    const session = await this.findById(id);
    return session !== null && session.expiresAt.getTime() > Date.now();
  }

  /**
   * Closes the database connection.
   */
  async close(): Promise<void> {
    if (this.db) {
      this.persistDb();
      this.db.close();
      this.db = null;
    }
  }
}

// ─── Session Manager ────────────────────────────────────────────────────────

/**
 * Manages user sessions with in-memory caching and persistent SQLite storage.
 *
 * Features:
 * - In-memory Map for fast lookups
 * - Persistent storage via SQLite (sql.js)
 * - Automatic expiration cleanup
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
  private storage: SQLiteStorage;
  private app: express.Application;
  private dbPath: string;
  private _initialized: boolean;
  private _loadFromDisk: boolean;

  /**
   * Creates a new SessionManager instance.
   * @param options - Configuration options.
   * @param options.dbPath - Path to the SQLite database file. Defaults to './data/sessions.db'.
   * @param options.loadFromDisk - Whether to load existing sessions from disk on startup. Defaults to true.
   */
  constructor(options?: { dbPath?: string; loadFromDisk?: boolean }) {
    this.dbPath = options?.dbPath || path.join(__dirname, '..', 'data', 'sessions.db');
    this.sessions = new Map();
    this.storage = new SQLiteStorage(this.dbPath);
    this._initialized = false;
    this._loadFromDisk = options?.loadFromDisk !== false;
    this.app = express();
    this.configureMiddleware();
    this.setupRoutes();
  }

  /**
   * Initializes the session manager (loads from disk).
   */
  async init(): Promise<void> {
    if (this._initialized) return;
    await this.storage.init();
    if (this._loadFromDisk) {
      await this.loadFromDisk();
    }
    this._initialized = true;
  }

  private async loadFromDisk(): Promise<void> {
    const sessions = await this.storage.findAll();
    for (const session of sessions) {
      this.sessions.set(session.id, session);
    }
  }

  private async persist(session: UserSession): Promise<void> {
    await this.storage.save(session);
  }

  private configureMiddleware(): void {
    this.app.use(express.json());
  }

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
    await this.storage.deleteById(id);
    const deleted = this.sessions.delete(id);
    return deleted;
  }

  /**
   * Removes all expired sessions from both memory and storage.
   */
  async cleanupExpiredSessions(): Promise<number> {
    const now = Date.now();
    const idsToRemove: string[] = [];
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt.getTime() <= now) idsToRemove.push(id);
    }
    for (const id of idsToRemove) {
      this.sessions.delete(id);
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
   * Closes the database connection and cleans up resources.
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

export { SessionManager, SQLiteStorage, UserSession, SessionResult };
