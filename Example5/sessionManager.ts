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
      }
    }
    return active;
  }

  /**
   * Get the count of all sessions (including expired ones).
   */
  getSessionCount(): number {
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
    // Prevent the interval from keeping the process alive
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Stop the automatic cleanup interval.
   */
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Manually remove all expired sessions.
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

// --- HTTP Server (for Docker / E2E) ---

export function startServer(sessionManager: SessionManager, port: number = 3000): void {
  const http = require('http');

  const server = http.createServer((req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');

    const url = new URL(req.url, `http://localhost:${port}`);
    const pathname = url.pathname;

    // --- GET /health ---
    if (req.method === 'GET' && pathname === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    // --- GET /sessions ---
    if (req.method === 'GET' && pathname === '/sessions') {
      const sessions = sessionManager.getAllSessions();
      res.writeHead(200);
      res.end(JSON.stringify(sessions));
      return;
    }

    // --- GET /sessions/<id> ---
    const sessionMatch = pathname.match(/^\/sessions\/(.+)$/);
    if (req.method === 'GET' && sessionMatch) {
      const id = decodeURIComponent(sessionMatch[1]);
      const session = sessionManager.getSession(id);
      if (session) {
        res.writeHead(200);
        res.end(JSON.stringify(session));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Session not found' }));
      }
      return;
    }

    // --- POST /sessions ---
    if (req.method === 'POST' && pathname === '/sessions') {
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const session: UserSession = {
            id: data.id,
            token: data.token,
            expiresAt: new Date(data.expiresAt),
            roles: data.roles || [],
          };
          sessionManager.addSession(session);
          res.writeHead(201);
          res.end(JSON.stringify(session));
        } catch (err: any) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON', details: err.message }));
        }
      });
      return;
    }

    // --- 404 fallback ---
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  server.listen(port, () => {
    console.log(`Session Manager server running on port ${port}`);
  });
}

// Auto-start when run directly via node
if (require.main === module) {
  const sm = new SessionManager();
  sm.startAutoCleanup();
  startServer(sm);
}