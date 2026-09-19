interface UserSession {
  id: string;
  token: string;
  expiresAt: Date;
  roles: string[];
}

class SessionManager {
  private sessions: Map<string, UserSession> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startAutoCleanup();
  }

  private startAutoCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60_000);
  }

  addSession(id: string, token: string, expiresAt: Date, roles: string[]): UserSession {
    const session: UserSession = { id, token, expiresAt, roles };
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

  getAllSessions(): UserSession[] {
    return Array.from(this.sessions.values()).filter(s => s.expiresAt > new Date());
  }

  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export { SessionManager, UserSession };