export interface UserSession {
  id: string;
  token: string;
  expiresAt: Date;
  roles: string[];
}

export class SessionManager {
  private sessions: Map<string, UserSession> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {}

  /**
   * Add a new session to the internal map.
   */
  addSession(session: UserSession): void {
    this.sessions.set(session.id, session);
  }

  /**
   * Check if a session exists and is not expired.
   * Returns the session if valid, null otherwise.
   */
  getSession(id: string): UserSession | null {
    const session = this.sessions.get(id);
    if (!session) {
      return null;
    }
    if (new Date() > session.expiresAt) {
      this.sessions.delete(id);
      return null;
    }
    return session;
  }

  /**
   * Check if a specific session is valid (exists and not expired).
   */
  isValid(id: string): boolean {
    return this.getSession(id) !== null;
  }

  /**
   * Remove a specific session by id.
   */
  removeSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  /**
   * Get all active (non-expired) sessions.
   */
  getAllSessions(): UserSession[] {
    const now = new Date();
    const active: UserSession[] = [];
    for (const [id, session] of this.sessions.entries()) {
      if (now <= session.expiresAt) {
        active.push(session);
      } else {
        this.sessions.delete(id);
      }
    }
    return active;
  }

  /**
   * Get the number of sessions (including expired ones).
   */
  count(): number {
    return this.sessions.size;
  }

  /**
   * Start automatic cleanup of expired sessions every 60 seconds.
   */
  startAutoCleanup(): void {
    if (this.cleanupInterval) {
      return; // Already running
    }
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60_000);
    // Allow the process to exit if this is the only active timer
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Stop automatic cleanup.
   */
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Manually clean up all expired sessions.
   */
  cleanupExpired(): number {
    const now = new Date();
    let removed = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(id);
        removed++;
      }
    }
    return removed;
  }

  /**
   * Clear all sessions.
   */
  clearAll(): void {
    this.sessions.clear();
  }
}

// ── Simple HTTP server for containerized deployment ───────────────────
if (require.main === module) {
  const http = require('http');
  const sessionManager = new SessionManager();
  sessionManager.startAutoCleanup();

  const server = http.createServer((req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok', sessions: sessionManager.count() }));
      return;
    }

    if (req.url === '/sessions' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(sessionManager.getAllSessions()));
      return;
    }

    if (req.url === '/sessions' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const session: UserSession = {
            id: data.id || `sess-${Date.now()}`,
            token: data.token || `token-${Date.now()}`,
            expiresAt: new Date(Date.now() + (data.expiresInMinutes || 60) * 60 * 1000),
            roles: data.roles || ['user'],
          };
          sessionManager.addSession(session);
          res.writeHead(201);
          res.end(JSON.stringify(session));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid request body' }));
        }
      });
      return;
    }

    if (req.url?.startsWith('/sessions/') && req.method === 'DELETE') {
      const id = req.url.replace('/sessions/', '');
      const removed = sessionManager.removeSession(id);
      res.writeHead(removed ? 200 : 404);
      res.end(JSON.stringify({ removed }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Session Manager running on port ${PORT}`);
  });
}

