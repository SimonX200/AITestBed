export interface UserSession {
  id: string;
  token: string;
  expiresAt: Date;
  roles: string[];
}

export class SessionManager {
  private sessions: Map<string, UserSession>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.sessions = new Map();
    this.cleanupInterval = null;
  }

  /**
   * Add a new session to the manager.
   */
  addSession(id: string, token: string, expiresAt: Date, roles: string[]): void {
    this.sessions.set(id, { id, token, expiresAt, roles });
    console.log(`[SessionManager] Session added: ${id} (expires: ${expiresAt.toISOString()})`);
  }

  /**
   * Check if a session exists and is still valid.
   */
  isValidSession(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) {
      return false;
    }
    if (new Date() > session.expiresAt) {
      this.sessions.delete(id);
      console.log(`[SessionManager] Session expired and removed: ${id}`);
      return false;
    }
    return true;
  }

  /**
   * Get session details by ID.
   */
  getSession(id: string): UserSession | undefined {
    const session = this.sessions.get(id);
    if (!session) {
      return undefined;
    }
    if (new Date() > session.expiresAt) {
      this.sessions.delete(id);
      return undefined;
    }
    return session;
  }

  /**
   * Remove a specific session.
   */
  removeSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  /**
   * List all active (non-expired) sessions.
   */
  listSessions(): UserSession[] {
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
   * Start automatic cleanup every N milliseconds (default: 60000).
   * @param intervalMs - Cleanup interval in milliseconds.
   */
  startAutoCleanup(intervalMs: number = 60_000): void {
    if (this.cleanupInterval) {
      return; // Already running
    }
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, intervalMs);
    console.log('[SessionManager] Auto-cleanup started (every %dms)', intervalMs);
  }

  /**
   * Stop automatic cleanup.
   */
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('[SessionManager] Auto-cleanup stopped');
    }
  }

  /**
   * Manually remove all expired sessions.
   */
  cleanupExpired(): void {
    const now = new Date();
    let removed = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(id);
        removed++;
      }
    }
    if (removed > 0) {
      console.log(`[SessionManager] Cleaned up ${removed} expired session(s)`);
    }
  }

  /**
   * Get the total number of sessions (including expired ones).
   */
  count(): number {
    return this.sessions.size;
  }

  /**
   * Clear all sessions.
   */
  clear(): void {
    this.sessions.clear();
    console.log('[SessionManager] All sessions cleared');
  }
}
