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

  addSession(id: string, token: string, expiresInMs: number, roles: string[]): UserSession {
    const session: UserSession = {
      id,
      token,
      expiresAt: new Date(Date.now() + expiresInMs),
      roles,
    };
    this.sessions.set(id, session);
    return session;
  }

  hasSession(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
    return session.expiresAt > new Date();
  }

  getSession(id: string): UserSession | undefined {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    if (session.expiresAt <= new Date()) {
      this.sessions.delete(id);
      return undefined;
    }
    return session;
  }

  removeSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  getAllSessions(): UserSession[] {
    const now = new Date();
    const active: UserSession[] = [];
    for (const [key, session] of this.sessions.entries()) {
      if (session.expiresAt > now) {
        active.push(session);
      }
    }
    return active;
  }

  startAutoCleanup(intervalMs: number = 60000): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, intervalMs);
  }

  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  private cleanupExpired(): void {
    const now = new Date();
    for (const [key, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(key);
      }
    }
  }
}

// --- HTTP Server (only runs when executed directly, not when imported) ---
const isMainModule = process.argv[1] && (
  process.argv[1].includes('sessionManager') ||
  process.argv[1].includes('bundle.js')
);

if (isMainModule) {
  import('http').then(({ createServer }) => {
    const PORT = 3000;
    const sessionManager = new SessionManager();
    sessionManager.startAutoCleanup(60000);

    const server = createServer((req, res) => {
      res.setHeader('Content-Type', 'application/json');

      const url = new URL(req.url || '', `http://localhost:${PORT}`);

      if (req.method === 'POST' && url.pathname === '/session') {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try {
            const { id, token, expiresInMs, roles } = JSON.parse(body);
            const session = sessionManager.addSession(id, token, expiresInMs || 60000, roles || []);
            res.writeHead(201);
            res.end(JSON.stringify(session));
          } catch (e: any) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      } else if (req.method === 'GET' && url.pathname === '/session') {
        const id = url.searchParams.get('id');
        if (!id) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'id parameter required' }));
          return;
        }
        const session = sessionManager.getSession(id);
        if (session) {
          res.writeHead(200);
          res.end(JSON.stringify(session));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Session not found or expired' }));
        }
      } else if (req.method === 'DELETE' && url.pathname === '/session') {
        const id = url.searchParams.get('id');
        if (!id) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'id parameter required' }));
          return;
        }
        const removed = sessionManager.removeSession(id);
        if (removed) {
          res.writeHead(200);
          res.end(JSON.stringify({ deleted: true }));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Session not found' }));
        }
      } else if (req.method === 'GET' && url.pathname === '/sessions') {
        const sessions = sessionManager.getAllSessions();
        res.writeHead(200);
        res.end(JSON.stringify(sessions));
      } else if (req.method === 'POST' && url.pathname === '/cleanup') {
        sessionManager.stopAutoCleanup();
        (sessionManager as any).cleanupExpired();
        res.writeHead(200);
        res.end(JSON.stringify({ cleaned: true }));
      } else if (req.method === 'GET' && url.pathname === '/health') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok' }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    });

    server.listen(PORT, () => {
      console.log(`Session Manager server running on port ${PORT}`);
    });
  });
}
