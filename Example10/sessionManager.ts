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

  startCleanup(intervalMs: number = 60000): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, intervalMs);
  }

  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  addSession(session: UserSession): void {
    this.sessions.set(session.id, session);
  }

  hasSession(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
    return new Date(session.expiresAt) > new Date();
  }

  getSession(id: string): UserSession | undefined {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    if (new Date(session.expiresAt) <= new Date()) {
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
    for (const [id, session] of this.sessions.entries()) {
      if (new Date(session.expiresAt) <= now) {
        this.sessions.delete(id);
        removed++;
      }
    }
    return removed;
  }

  getAllSessions(): UserSession[] {
    const now = new Date();
    const result: UserSession[] = [];
    for (const session of this.sessions.values()) {
      if (new Date(session.expiresAt) > now) {
        result.push(session);
      }
    }
    return result;
  }

  getSessionCount(): number {
    return this.getAllSessions().length;
  }
}

// --- CLI entry point for deploy.sh ---
if (require.main === module) {
  const manager = new SessionManager();
  manager.startCleanup();

  // Add a test session
  const testSession: UserSession = {
    id: "test-1",
    token: "abc123",
    expiresAt: new Date(Date.now() + 3600000),
    roles: ["admin", "user"],
  };
  manager.addSession(testSession);

  console.log("SessionManager started. Sessions:", manager.getSessionCount());
  console.log("Session test-1 valid:", manager.hasSession("test-1"));

  // Keep alive
  process.on("SIGINT", () => {
    manager.stopCleanup();
    process.exit(0);
  });
}
