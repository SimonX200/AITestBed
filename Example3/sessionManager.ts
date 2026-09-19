interface UserSession {
  id: string;
  token: string;
  expiresAt: Date;
  roles: string[];
}

class SessionManager {
  private sessions: Map<string, UserSession> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startAutoCleanup();
  }

  private startAutoCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60_000);
  }

  addSession(id: string, token: string, ttlMs: number = 3600_000, roles: string[] = []): UserSession {
    const session: UserSession = {
      id,
      token,
      expiresAt: new Date(Date.now() + ttlMs),
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

  getSessionCount(): number {
    return this.sessions.size;
  }

  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export { SessionManager, UserSession };

// ── Keep-alive HTTP server for container deployment ──────────────────
import { createServer } from "http";

const server = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok", service: "session-manager" }));
});

const PORT = parseInt(process.env.PORT || "3000", 10);
server.listen(PORT, () => {
  console.log(`Session manager listening on port ${PORT}`);
});