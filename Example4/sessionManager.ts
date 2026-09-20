import * as http from 'http';

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

  addSession(session: UserSession): void {
    this.sessions.set(session.id, session);
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
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(id);
      }
    }
  }

  getAllSessions(): UserSession[] {
    return Array.from(this.sessions.values());
  }

  getSessionCount(): number {
    return this.sessions.size;
  }
}

// --- HTTP Server ---
const PORT = parseInt(process.env.PORT || '3001', 10);
const manager = new SessionManager();

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method || 'GET';

  res.setHeader('Content-Type', 'application/json');

  if (method === 'GET' && path === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', sessions: manager.getSessionCount() }));
    return;
  }

  if (method === 'GET' && path === '/sessions') {
    res.writeHead(200);
    res.end(JSON.stringify(manager.getAllSessions()));
    return;
  }

  if (method === 'GET' && path.startsWith('/sessions/')) {
    const id = path.replace('/sessions/', '');
    const session = manager.getSession(id);
    if (session) {
      res.writeHead(200);
      res.end(JSON.stringify(session));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Session not found' }));
    }
    return;
  }

  if (method === 'POST' && path === '/sessions') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const session: UserSession = JSON.parse(body);
        session.expiresAt = new Date(session.expiresAt);
        manager.addSession(session);
        res.writeHead(201);
        res.end(JSON.stringify({ message: 'Session created', session }));
      } catch (e: any) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON', details: e.message }));
      }
    });
    return;
  }

  if (method === 'DELETE' && path.startsWith('/sessions/')) {
    const id = path.replace('/sessions/', '');
    const removed = manager.removeSession(id);
    if (removed) {
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Session removed' }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Session not found' }));
    }
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Session Manager API running on port ${PORT}`);
  manager.startAutoCleanup(60000);
});