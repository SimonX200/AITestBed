/**
 * SessionManager - Manages user sessions with automatic expiration cleanup.
 *
 * Provides CRUD-like operations for UserSession objects stored in memory,
 * plus an HTTP API layer for remote session management.
 *
 * @module sessionManager
 */

import http, { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

// ─── Data Types ───────────────────────────────────────────────────────────────

/**
 * Represents an authenticated user session.
 *
 * @interface UserSession
 */
export interface UserSession {
  /** Unique session identifier (UUID v4 recommended) */
  id: string;
  /** Authentication token (JWT or opaque token) */
  token: string;
  /** Timestamp when this session expires */
  expiresAt: Date;
  /** Roles assigned to the session (e.g. ["admin", "user"]) */
  roles: string[];
}

// ─── SessionManager ───────────────────────────────────────────────────────────

/**
 * In-memory session store with automatic cleanup of expired sessions.
 *
 * Usage:
 *   const mgr = new SessionManager();
 *   const session = mgr.createSession('user1', ['admin']);
 *   const valid = mgr.isValid(session.id);
 *   mgr.removeSession(session.id);
 */
export class SessionManager {
  /** Internal Map storing sessions by their unique id */
  private sessions: Map<string, UserSession> = new Map();

  /** Interval handle for the periodic cleanup timer */
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Creates a new SessionManager and starts the automatic cleanup interval.
   *
   * Cleanup runs every 60 seconds to remove expired sessions.
   */
  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanupExpired(), 60_000);
  }

  /**
   * Creates a new session for the given userId with the specified roles.
   *
   * @param userId - The user identifier to associate with the session.
   * @param roles  - Array of role strings for this session.
   * @param ttlMs  - Time-to-live in milliseconds (default: 3600000 = 1 hour).
   * @returns The newly created UserSession.
   */
  createSession(userId: string, roles: string[], ttlMs: number = 3_600_000): UserSession {
    const id = this.generateId();
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + ttlMs);

    const session: UserSession = { id, token, expiresAt, roles };
    this.sessions.set(id, session);
    return session;
  }

  /**
   * Retrieves a session by its id, or undefined if not found.
   *
   * @param id - The session identifier.
   * @returns The UserSession or undefined.
   */
  getSession(id: string): UserSession | undefined {
    return this.sessions.get(id);
  }

  /**
   * Checks whether a session exists and has not yet expired.
   *
   * @param id - The session identifier.
   * @returns true if the session is valid (exists and not expired).
   */
  isValid(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
    return session.expiresAt > new Date();
  }

  /**
   * Removes a session from the store.
   *
   * @param id - The session identifier to remove.
   * @returns true if the session was found and removed.
   */
  removeSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  /**
   * Returns a snapshot of all sessions (including expired ones).
   * Useful for debugging / monitoring.
   */
  getAllSessions(): UserSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Returns only non-expired sessions.
   */
  getActiveSessions(): UserSession[] {
    const now = new Date();
    return Array.from(this.sessions.values()).filter((s) => s.expiresAt > now);
  }

  /**
   * Removes all sessions that have passed their expiresAt timestamp.
   * Called automatically every 60 seconds via setInterval.
   *
   * @returns The number of sessions that were removed.
   */
  cleanupExpired(): number {
    const now = new Date();
    let removed = 0;
    for (const [id, session] of this.sessions) {
      if (session.expiresAt <= now) {
        this.sessions.delete(id);
        removed++;
      }
    }
    return removed;
  }

  /**
   * Stops the automatic cleanup interval.
   * Call this when shutting down the application.
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Clears all sessions from the store.
   */
  clear(): void {
    this.sessions.clear();
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private generateId(): string {
    return crypto.randomUUID();
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// ─── HTTP API Layer ───────────────────────────────────────────────────────────

/**
 * HTTP request handler that exposes REST-like endpoints for session management.
 *
 * Endpoints:
 *   POST   /sessions          - Create a new session
 *   GET    /sessions          - List all active sessions
 *   GET    /sessions/:id      - Get a specific session
 *   DELETE /sessions/:id      - Delete a session
 *   GET    /health            - Health check
 *
 * @param sessionManager - The SessionManager instance to operate on.
 * @returns An http.requestListener function.
 */
export function createSessionHandler(sessionManager: SessionManager): http.RequestListener {
  return (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const method = req.method || 'GET';

    // ── Health check ──
    if (method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString(), activeSessions: sessionManager.getActiveSessions().length });
      return;
    }

    // ── Create session: POST /sessions ──
    if (method === 'POST' && url.pathname === '/sessions') {
      handleCreateSession(sessionManager, req, res);
      return;
    }

    // ── List sessions: GET /sessions ──
    if (method === 'GET' && url.pathname === '/sessions') {
      sendJson(res, 200, sessionManager.getActiveSessions());
      return;
    }

    // ── Get / Delete session: GET/DELETE /sessions/:id ──
    const sessionMatch = url.pathname.match(/^\/sessions\/(.+)$/);
    if (sessionMatch) {
      const id = decodeURIComponent(sessionMatch[1]);

      if (method === 'GET') {
        const session = sessionManager.getSession(id);
        if (!session) {
          sendJson(res, 404, { error: 'Session not found' });
          return;
        }
        sendJson(res, 200, session);
        return;
      }

      if (method === 'DELETE') {
        const removed = sessionManager.removeSession(id);
        if (!removed) {
          sendJson(res, 404, { error: 'Session not found' });
          return;
        }
        sendJson(res, 200, { message: 'Session deleted', id });
        return;
      }
    }

    // ── Fallback: 404 ──
    sendJson(res, 404, { error: `Route ${method} ${url.pathname} not found` });
  };
}

/**
 * Parses the JSON body of an incoming request.
 */
function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Handles POST /sessions — creates a new session from the request body.
 *
 * Expected body: { userId: string, roles?: string[], ttlMs?: number }
 */
async function handleCreateSession(
  sessionManager: SessionManager,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const body = await parseBody(req);
    const userId = typeof body.userId === 'string' ? body.userId : 'anonymous';
    const roles = Array.isArray(body.roles) ? body.roles : ['user'];
    const ttlMs = typeof body.ttlMs === 'number' ? body.ttlMs : 3_600_000;

    const session = sessionManager.createSession(userId, roles, ttlMs);
    sendJson(res, 201, session);
  } catch (err) {
    sendJson(res, 400, { error: 'Bad request', details: (err as Error).message });
  }
}

/**
 * Sends a JSON response with the given status code and body.
 */
function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json),
  });
  res.end(json);
}

// ─── Server Bootstrap ─────────────────────────────────────────────────────────

/**
 * Starts the HTTP server on the given port.
 *
 * Reads the port from the environment variable EXAMPLE_SESSIONMANAGER_PORT,
 * defaulting to 3500 if not set.
 *
 * @returns The running http.Server instance.
 */
export function startServer(sessionManager: SessionManager, port?: number): http.Server {
  const serverPort = port ?? parseInt(process.env.EXAMPLE_SESSIONMANAGER_PORT || '3500', 10);

  const server = http.createServer(createSessionHandler(sessionManager));

  server.listen(serverPort, () => {
    console.log(`SessionManager HTTP server running on port ${serverPort}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\nShutting down gracefully...');
    sessionManager.stop();
    server.close(() => {
      console.log('Server shut down complete.');
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 5000).unref();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return server;
}

// ─── CLI Entry Point ──────────────────────────────────────────────────────────

/**
 * When run directly via `node dist/bundle.js`, starts the HTTP server.
 */
if (import.meta.main === true || process.argv[1]?.endsWith('bundle.js')) {
  const mgr = new SessionManager();
  startServer(mgr);
}
