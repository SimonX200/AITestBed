import { SessionManager, UserSession } from '../src/sessionManager';

describe('SessionManager', () => {
    let manager: SessionManager;

    beforeEach(() => {
        // Ohne Redis für Unit Tests
        manager = new SessionManager();
    });

    describe('addSession', () => {
        it('should create a new session with valid data', async () => {
            const session = await manager.addSession('user1', ['admin', 'user']);

            expect(session).toBeDefined();
            expect(session.id).toBeDefined();
            expect(session.token).toBeDefined();
            expect(session.expiresAt).toBeInstanceOf(Date);
            expect(session.roles).toEqual(['admin', 'user']);
        });

        it('should create session with empty roles array', async () => {
            const session = await manager.addSession('user2', []);

            expect(session.roles).toEqual([]);
        });

        it('should generate unique session IDs', async () => {
            const session1 = await manager.addSession('user1', []);
            const session2 = await manager.addSession('user2', []);

            expect(session1.id).not.toBe(session2.id);
        });
    });

    describe('getSession', () => {
        it('should return session by id', async () => {
            const session = await manager.addSession('user1', ['admin']);
            const retrieved = await manager.getSession(session.id);

            expect(retrieved).not.toBeNull();
            expect(retrieved?.id).toBe(session.id);
            expect(retrieved?.token).toBe(session.token);
        });

        it('should return null for non-existent session', async () => {
            const retrieved = await manager.getSession('non-existent-id');

            expect(retrieved).toBeNull();
        });

        it('should auto-remove expired session', async () => {
            const session = await manager.addSession('user1', []);
            // Manuell Ablaufdatum setzen für Test
            (session as any).expiresAt = new Date(Date.now() - 1000);
            manager['sessions'].set(session.id, session);

            const retrieved = await manager.getSession(session.id);

            expect(retrieved).toBeNull();
            // Session sollte aus Map entfernt worden sein
            expect(manager['sessions'].has(session.id)).toBe(false);
        });
    });

    describe('hasValidSession', () => {
        it('should return true for valid session', async () => {
            const session = await manager.addSession('user1', []);
            const isValid = await manager.hasValidSession(session.id);

            expect(isValid).toBe(true);
        });

        it('should return false for non-existent session', async () => {
            const isValid = await manager.hasValidSession('non-existent-id');

            expect(isValid).toBe(false);
        });

        it('should return false for expired session', async () => {
            const session = await manager.addSession('user1', []);
            (session as any).expiresAt = new Date(Date.now() - 1000);
            manager['sessions'].set(session.id, session);

            const isValid = await manager.hasValidSession(session.id);

            expect(isValid).toBe(false);
        });
    });

    describe('removeSession', () => {
        it('should remove existing session', async () => {
            const session = await manager.addSession('user1', []);
            const removed = await manager.removeSession(session.id);

            expect(removed).toBe(true);
            expect(manager['sessions'].has(session.id)).toBe(false);
        });

        it('should return false for non-existent session', async () => {
            const removed = await manager.removeSession('non-existent-id');

            expect(removed).toBe(false);
        });
    });

    describe('cleanupExpired', () => {
        it('should remove all expired sessions', async () => {
            const session1 = await manager.addSession('user1', []);
            const session2 = await manager.addSession('user2', []);
            const session3 = await manager.addSession('user3', []);

            // Setze Ablaufdatum für session1 und session3
            (session1 as any).expiresAt = new Date(Date.now() - 1000);
            (session3 as any).expiresAt = new Date(Date.now() - 1000);
            manager['sessions'].set(session1.id, session1);
            manager['sessions'].set(session3.id, session3);

            const cleaned = await manager.cleanupExpired();

            expect(cleaned).toBe(2);
            expect(manager['sessions'].has(session1.id)).toBe(false);
            expect(manager['sessions'].has(session2.id)).toBe(true);
            expect(manager['sessions'].has(session3.id)).toBe(false);
        });

        it('should return 0 when no sessions are expired', async () => {
            await manager.addSession('user1', []);
            await manager.addSession('user2', []);

            const cleaned = await manager.cleanupExpired();

            expect(cleaned).toBe(0);
        });
    });

    describe('Session expiration', () => {
        it('should set expiration to 1 hour from now', async () => {
            const before = Date.now();
            const session = await manager.addSession('user1', []);
            const after = Date.now();

            expect(session.expiresAt.getTime()).toBeGreaterThanOrEqual(before + 3599000);
            expect(session.expiresAt.getTime()).toBeLessThanOrEqual(after + 3601000);
        });
    });
});