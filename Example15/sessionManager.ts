import express, { Request, Response } from 'express';

// ==================== Interfaces ====================

export interface UserSession {
  id: string;
  token: string;
  expiresAt: Date;
  roles: string[];
}

// ==================== SessionManager Class ====================

export class SessionManager {
  private sessions: Map<string, UserSession>;
  private cleanupInterval: NodeJS.Timeout | null;
  private readonly cleanupMs: number;

  constructor(cleanupIntervalMs: number = 60_000, autoStartCleanup: boolean = true) {
    this.sessions = new Map();
    this.cleanupMs = cleanupIntervalMs;
    this.cleanupInterval = null;
    if (autoStartCleanup) {
      this.startAutoCleanup();
    }
  }

  /** Start automatic cleanup of expired sessions */
  private startAutoCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, this.cleanupMs);
  }

  /** Stop the auto-cleanup interval */
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /** Add a new session */
  addSession(id: string, token: string, expiresAt: Date, roles: string[]): UserSession {
    const session: UserSession = { id, token, expiresAt, roles };
    this.sessions.set(id, session);
    return session;
  }

  /** Get a session by id */
  getSession(id: string): UserSession | undefined {
    return this.sessions.get(id);
  }

  /** Check if a session exists and is not expired */
  isValidSession(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
    if (session.expiresAt <= new Date()) {
      this.sessions.delete(id);
      return false;
    }
    return true;
  }

  /** Check if user has a specific role */
  hasRole(id: string, role: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
    if (session.expiresAt <= new Date()) {
      this.sessions.delete(id);
      return false;
    }
    return session.roles.includes(role);
  }

  /** Remove a session */
  removeSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  /** Remove all expired sessions */
  cleanupExpired(): number {
    const now = new Date();
    let removed = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(id);
        removed++;
      }
    }
    return removed;
  }

  /** Get all active (non-expired) sessions */
  getAllSessions(): UserSession[] {
    const now = new Date();
    const active: UserSession[] = [];
    for (const session of this.sessions.values()) {
      if (session.expiresAt > now) {
        active.push(session);
      }
    }
    return active;
  }

  /** Get session count */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /** Get all sessions (including expired) */
  getAllSessionsRaw(): UserSession[] {
    return Array.from(this.sessions.values());
  }
}

// ==================== Express App Setup ====================

const sessionManager = new SessionManager(60_000, false);
const app = express();
app.use(express.json());

// POST /api/sessions - Create a new session
app.post('/api/sessions', (req: Request, res: Response) => {
  const { id, token, expiresInMinutes = 30, roles = ['user'] } = req.body;
  if (!id || !token) {
    res.status(400).json({ error: 'id and token are required' });
    return;
  }
  const expiresAt = new Date(Date.now() + (expiresInMinutes || 30) * 60_000);
  const session = sessionManager.addSession(id, token, expiresAt, roles);
  res.status(201).json({
    message: 'Session created',
    session: {
      id: session.id,
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
      roles: session.roles,
    },
  });
});

// GET /api/sessions/:id - Get session info
app.get('/api/sessions/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const session = sessionManager.getSession(id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  if (session.expiresAt <= new Date()) {
    sessionManager.removeSession(id);
    res.status(401).json({ error: 'Session expired' });
    return;
  }
  res.json({
    id: session.id,
    token: session.token,
    expiresAt: session.expiresAt.toISOString(),
    roles: session.roles,
  });
});

// GET /api/sessions/:id/valid - Check if session is valid
app.get('/api/sessions/:id/valid', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const valid = sessionManager.isValidSession(id);
  res.json({ id, valid });
});

// GET /api/sessions/:id/role/:role - Check if session has role
app.get('/api/sessions/:id/role/:role', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const role = req.params.role as string;
  const hasRole = sessionManager.hasRole(id, role);
  res.json({ id, role, hasRole });
});

// DELETE /api/sessions/:id - Remove a session
app.delete('/api/sessions/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const removed = sessionManager.removeSession(id);
  if (!removed) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json({ message: 'Session removed', id: req.params.id });
});

// GET /api/sessions - List all active sessions
app.get('/api/sessions', (req: Request, res: Response) => {
  const sessions = sessionManager.getAllSessions();
  res.json({ count: sessions.length, sessions: sessions.map(s => ({
    id: s.id,
    token: s.token,
    expiresAt: s.expiresAt.toISOString(),
    roles: s.roles,
  }))});
});

// POST /api/sessions/cleanup - Manually trigger cleanup
app.post('/api/sessions/cleanup', (req: Request, res: Response) => {
  const removed = sessionManager.cleanupExpired();
  res.json({ message: 'Cleanup completed', removed });
});

// Start server if run directly
const PORT = process.env.PORT || 3000;
let server: ReturnType<typeof app.listen> | null = null;

if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`Session Manager API running on port ${PORT}`);
  });
}

export { app, server };
