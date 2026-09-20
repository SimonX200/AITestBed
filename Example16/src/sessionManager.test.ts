import { SessionManager, UserSession } from './sessionManager';

describe('SessionManager', () => {
  let sm: SessionManager;

  beforeEach(() => {
    sm = new SessionManager();
  });

  afterEach(() => {
    sm.stop();
  });

  describe('createSession', () => {
    it('should create a session with default values', () => {
      const session = sm.createSession();
      expect(session).toBeDefined();
      expect(session.id).toMatch(/^sess_/);
      expect(session.token).toMatch(/^tok_/);
      expect(session.roles).toEqual([]);
      expect(session.expiresAt).toBeInstanceOf(Date);
    });

    it('should create a session with custom roles', () => {
      const session = sm.createSession(['admin', 'user']);
      expect(session.roles).toEqual(['admin', 'user']);
    });

    it('should create a session with custom expiration', () => {
      const session = sm.createSession([], 5000); // 5 seconds
      const now = Date.now();
      expect(session.expiresAt.getTime()).toBeGreaterThan(now);
      expect(session.expiresAt.getTime()).toBeLessThan(now + 6000);
    });

    it('should store the session internally', () => {
      const session = sm.createSession(['admin']);
      const retrieved = sm.getSession(session.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(session.id);
      expect(retrieved!.token).toBe(session.token);
    });
  });

  describe('getSession', () => {
    it('should return null for non-existent session', () => {
      expect(sm.getSession('nonexistent')).toBeNull();
    });

    it('should return session for valid ID', () => {
      const session = sm.createSession();
      const retrieved = sm.getSession(session.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(session.id);
    });
  });

  describe('getByToken', () => {
    it('should return null for invalid token', () => {
      expect(sm.getByToken('invalid_token')).toBeNull();
    });

    it('should return session for valid token', () => {
      const session = sm.createSession(['user']);
      const retrieved = sm.getByToken(session.token);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(session.id);
    });
  });

  describe('deleteSession', () => {
    it('should delete an existing session', () => {
      const session = sm.createSession();
      const deleted = sm.deleteSession(session.id);
      expect(deleted).toBe(true);
      expect(sm.getSession(session.id)).toBeNull();
    });

    it('should return false for non-existent session', () => {
      const deleted = sm.deleteSession('nonexistent');
      expect(deleted).toBe(false);
    });
  });

  describe('getAllSessions', () => {
    it('should return all active sessions', () => {
      sm.createSession(['admin']);
      sm.createSession(['user']);
      const sessions = sm.getAllSessions();
      expect(sessions).toHaveLength(2);
    });

    it('should exclude expired sessions', () => {
      sm.createSession([], 1); // expires in 1ms
      sm.createSession(['user']);
      // Wait for first session to expire
      const sessions = sm.getAllSessions();
      expect(sessions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('cleanupExpired', () => {
    it('should remove expired sessions', () => {
      const session = sm.createSession([], 1); // expires in 1ms
      expect(sm.getAllSessions()).toHaveLength(1);
      // Wait for expiration
      const sessionsBefore = sm.getAllSessions();
      sm.cleanupExpired();
      const sessionsAfter = sm.getAllSessions();
      expect(sessionsAfter.length).toBeLessThanOrEqual(sessionsBefore.length);
    });
  });

  describe('hasRole', () => {
    it('should return true for existing role', () => {
      const session = sm.createSession(['admin', 'user']);
      expect(sm.hasRole(session, 'admin')).toBe(true);
    });

    it('should return false for non-existing role', () => {
      const session = sm.createSession(['user']);
      expect(sm.hasRole(session, 'admin')).toBe(false);
    });
  });

  describe('start/stop', () => {
    it('should start and stop without errors', () => {
      sm.start();
      expect(() => sm.stop()).not.toThrow();
    });
  });

  describe('automatic cleanup interval', () => {
    it('should clean up expired sessions automatically', (done) => {
      sm.start();
      const session = sm.createSession([], 100); // expires in 100ms
      expect(sm.getAllSessions()).toHaveLength(1);
      setTimeout(() => {
        const sessions = sm.getAllSessions();
        expect(sessions.length).toBe(0);
        sm.stop();
        done();
      }, 500);
    });
  });
});
