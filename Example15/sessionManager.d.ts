export interface UserSession {
    id: string;
    token: string;
    expiresAt: Date;
    roles: string[];
}
export declare class SessionManager {
    private sessions;
    private cleanupInterval;
    private readonly cleanupMs;
    constructor(cleanupIntervalMs?: number);
    /** Start automatic cleanup of expired sessions */
    private startAutoCleanup;
    /** Stop the auto-cleanup interval */
    stopAutoCleanup(): void;
    /** Add a new session */
    addSession(id: string, token: string, expiresAt: Date, roles: string[]): UserSession;
    /** Get a session by id */
    getSession(id: string): UserSession | undefined;
    /** Check if a session exists and is not expired */
    isValidSession(id: string): boolean;
    /** Check if user has a specific role */
    hasRole(id: string, role: string): boolean;
    /** Remove a session */
    removeSession(id: string): boolean;
    /** Remove all expired sessions */
    cleanupExpired(): number;
    /** Get all active (non-expired) sessions */
    getAllSessions(): UserSession[];
    /** Get session count */
    getSessionCount(): number;
    /** Get all sessions (including expired) */
    getAllSessionsRaw(): UserSession[];
}
declare const app: import("express-serve-static-core").Express;
declare let server: ReturnType<typeof app.listen> | null;
export { app, server };
//# sourceMappingURL=sessionManager.d.ts.map