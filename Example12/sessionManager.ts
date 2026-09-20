// ============================================================
// sessionManager.ts
// Interface & Klasse für Session-Management mit HTTP-Endpoints
// ============================================================

export interface UserSession {
  id: string;
  token: string;
  expiresAt: Date;
  roles: string[];
}

export class SessionManager {
  private sessions: Map<string, UserSession> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startAutoCleanup();
  }

  /** Startet die automatische Bereinigung abgelaufener Sessions alle 60 Sekunden */
  private startAutoCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60_000);
  }

  /** Fügt eine neue Session hinzu */
  addSession(id: string, token: string, expiresAt: Date, roles: string[]): UserSession {
    const session: UserSession = { id, token, expiresAt, roles };
    this.sessions.set(id, session);
    return session;
  }

  /** Prüft, ob eine Session existiert und nicht abgelaufen ist */
  isValidSession(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
    return session.expiresAt > new Date();
  }

  /** Gibt die Session zurück, falls vorhanden und gültig */
  getSession(id: string): UserSession | null {
    const session = this.sessions.get(id);
    if (!session) return null;
    if (session.expiresAt <= new Date()) {
      this.sessions.delete(id);
      return null;
    }
    return session;
  }

  /** Entfernt alle abgelaufenen Sessions */
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

  /** Entfernt eine spezifische Session */
  removeSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  /** Gibt alle aktiven Sessions zurück */
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

  /** Prüft, ob eine Session eine bestimmte Rolle hat */
  hasRole(id: string, role: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
    return session.roles.includes(role);
  }

  /** Stoppt die automatische Bereinigung */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /** Gibt die Anzahl der gespeicherten Sessions zurück */
  get sessionCount(): number {
    return this.sessions.size;
  }
}


// ============================================================
// HTTP-Server mit Endpoints für Session-Management
// ============================================================

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';

const sessionManager = new SessionManager();

function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendJSON(res: ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function handleRequest(req: IncomingMessage, res: ServerResponse): void {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost:3000'}`);
  const method = req.method || 'GET';

  // GET /health
  if (method === 'GET' && url.pathname === '/health') {
    sendJSON(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
    return;
  }

  // POST /session/create
  if (method === 'POST' && url.pathname === '/session/create') {
    parseBody(req).then(async (body) => {
      try {
        const { id, token, expiresInMinutes = 30, roles = ['user'] } = JSON.parse(body);
        if (!id || !token) {
          sendJSON(res, 400, { error: 'id and token are required' });
          return;
        }
        const expiresAt = new Date(Date.now() + (expiresInMinutes || 30) * 60_000);
        const session = sessionManager.addSession(id, token, expiresAt, roles);
        sendJSON(res, 201, { message: 'Session created', session: { id: session.id, expiresAt: session.expiresAt, roles: session.roles } });
      } catch (e: any) {
        sendJSON(res, 400, { error: 'Invalid request body', details: e.message });
      }
    }).catch((err) => {
      sendJSON(res, 500, { error: 'Internal server error', details: err.message });
    });
    return;
  }

  // GET /session/validate?id=xxx
  if (method === 'GET' && url.pathname === '/session/validate') {
    const id = url.searchParams.get('id');
    if (!id) {
      sendJSON(res, 400, { error: 'id parameter is required' });
      return;
    }
    const valid = sessionManager.isValidSession(id);
    sendJSON(res, 200, { id, valid });
    return;
  }

  // GET /session/get?id=xxx
  if (method === 'GET' && url.pathname === '/session/get') {
    const id = url.searchParams.get('id');
    if (!id) {
      sendJSON(res, 400, { error: 'id parameter is required' });
      return;
    }
    const session = sessionManager.getSession(id);
    if (!session) {
      sendJSON(res, 404, { error: 'Session not found or expired' });
      return;
    }
    sendJSON(res, 200, { session: { id: session.id, expiresAt: session.expiresAt, roles: session.roles } });
    return;
  }

  // POST /session/remove?id=xxx
  if (method === 'POST' && url.pathname === '/session/remove') {
    const id = url.searchParams.get('id');
    if (!id) {
      sendJSON(res, 400, { error: 'id parameter is required' });
      return;
    }
    const removed = sessionManager.removeSession(id);
    sendJSON(res, 200, { removed });
    return;
  }

  // GET /session/list
  if (method === 'GET' && url.pathname === '/session/list') {
    const sessions = sessionManager.getAllSessions();
    sendJSON(res, 200, { count: sessions.length, sessions: sessions.map(s => ({ id: s.id, expiresAt: s.expiresAt, roles: s.roles })) });
    return;
  }

  // POST /session/cleanup
  if (method === 'POST' && url.pathname === '/session/cleanup') {
    const removed = sessionManager.cleanupExpired();
    sendJSON(res, 200, { removed });
    return;
  }

  // GET /session/checkRole?id=xxx&role=xxx
  if (method === 'GET' && url.pathname === '/session/checkRole') {
    const id = url.searchParams.get('id');
    const role = url.searchParams.get('role');
    if (!id || !role) {
      sendJSON(res, 400, { error: 'id and role parameters are required' });
      return;
    }
    const hasRole = sessionManager.hasRole(id, role);
    sendJSON(res, 200, { id, role, hasRole });
    return;
  }

  sendJSON(res, 404, { error: 'Not found' });
}

const PORT = parseInt(process.env.PORT || '3000', 10);
const server = createServer(handleRequest);

let httpServer: ReturnType<typeof server.listen>;

function startServer(port: number = PORT) {
  return new Promise<void>((resolve) => {
    httpServer = server.listen(port, () => {
      console.log(`Session Manager server running on port ${port}`);
      resolve();
    });
  });
}

// Start server only when run directly (not when imported as module)
if (require.main === module) {
  startServer().catch(console.error);
}

export { sessionManager, startServer, server };
