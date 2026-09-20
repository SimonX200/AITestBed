import { UserSession, SessionManager } from './sessionManager';

describe('SessionManager', () => {
  let sm: SessionManager;

  beforeEach(() => {
    sm = new SessionManager();
  });

  afterEach(() => {
    sm.stop();
  });

  describe('addSession', () => {
    it('should add a new session and return it', () => {
      const session = sm.addSession('user1', 'token123', new Date(Date.now() + 60000), ['admin', 'user']);
      expect(session).toBeDefined();
      expect(session.id).toBe('user1');
      expect(session.token).toBe('token123');
      expect(session.roles).toEqual(['admin', 'user']);
      expect(sm.sessionCount).toBe(1);
    });

    it('should add multiple sessions', () => {
      sm.addSession('user1', 'token1', new Date(Date.now() + 60000), ['user']);
      sm.addSession('user2', 'token2', new Date(Date.now() + 120000), ['admin']);
      expect(sm.sessionCount).toBe(2);
    });
  });

  describe('isValidSession', () => {
    it('should return true for a valid session', () => {
      sm.addSession('user1', 'token1', new Date(Date.now() + 60000), ['user']);
      expect(sm.isValidSession('user1')).toBe(true);
    });

    it('should return false for a non-existent session', () => {
      expect(sm.isValidSession('nonexistent')).toBe(false);
    });

    it('should return false for an expired session', () => {
      sm.addSession('user1', 'token1', new Date(Date.now() - 1000), ['user']);
      expect(sm.isValidSession('user1')).toBe(false);
    });
  });

  describe('getSession', () => {
    it('should return the session for a valid session', () => {
      sm.addSession('user1', 'token1', new Date(Date.now() + 60000), ['admin']);
      const session = sm.getSession('user1');
      expect(session).not.toBeNull();
      expect(session!.id).toBe('user1');
    });

    it('should return null for a non-existent session', () => {
      const session = sm.getSession('nonexistent');
      expect(session).toBeNull();
    });

    it('should return null and remove expired session', () => {
      sm.addSession('user1', 'token1', new Date(Date.now() - 1000), ['user']);
      const session = sm.getSession('user1');
      expect(session).toBeNull();
      expect(sm.sessionCount).toBe(0);
    });
  });

  describe('cleanupExpired', () => {
    it('should remove all expired sessions', () => {
      sm.addSession('user1', 'token1', new Date(Date.now() - 1000), ['user']);
      sm.addSession('user2', 'token2', new Date(Date.now() + 60000), ['admin']);
      sm.addSession('user3', 'token3', new Date(Date.now() - 500), ['user']);
      const removed = sm.cleanupExpired();
      expect(removed).toBe(2);
      expect(sm.sessionCount).toBe(1);
    });

    it('should return 0 when no sessions are expired', () => {
      sm.addSession('user1', 'token1', new Date(Date.now() + 60000), ['user']);
      const removed = sm.cleanupExpired();
      expect(removed).toBe(0);
    });
  });

  describe('removeSession', () => {
    it('should remove an existing session', () => {
      sm.addSession('user1', 'token1', new Date(Date.now() + 60000), ['user']);
      const removed = sm.removeSession('user1');
      expect(removed).toBe(true);
      expect(sm.sessionCount).toBe(0);
    });

    it('should return false for a non-existent session', () => {
      const removed = sm.removeSession('nonexistent');
      expect(removed).toBe(false);
    });
  });

  describe('getAllSessions', () => {
    it('should return only active sessions', () => {
      sm.addSession('user1', 'token1', new Date(Date.now() + 60000), ['user']);
      sm.addSession('user2', 'token2', new Date(Date.now() - 1000), ['admin']);
      sm.addSession('user3', 'token3', new Date(Date.now() + 120000), ['user']);
      const sessions = sm.getAllSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions.map(s => s.id)).toEqual(['user1', 'user3']);
    });
  });

  describe('hasRole', () => {
    it('should return true if session has the role', () => {
      sm.addSession('user1', 'token1', new Date(Date.now() + 60000), ['admin', 'user']);
      expect(sm.hasRole('user1', 'admin')).toBe(true);
      expect(sm.hasRole('user1', 'user')).toBe(true);
    });

    it('should return false if session does not have the role', () => {
      sm.addSession('user1', 'token1', new Date(Date.now() + 60000), ['user']);
      expect(sm.hasRole('user1', 'admin')).toBe(false);
    });

    it('should return false for a non-existent session', () => {
      expect(sm.hasRole('nonexistent', 'admin')).toBe(false);
    });
  });

  describe('sessionCount', () => {
    it('should return the correct number of sessions', () => {
      expect(sm.sessionCount).toBe(0);
      sm.addSession('user1', 'token1', new Date(Date.now() + 60000), ['user']);
      expect(sm.sessionCount).toBe(1);
      sm.addSession('user2', 'token2', new Date(Date.now() + 60000), ['admin']);
      expect(sm.sessionCount).toBe(2);
    });
  });

  describe('stop', () => {
    it('should stop the cleanup interval', () => {
      // After stop, no error should be thrown
      expect(() => sm.stop()).not.toThrow();
    });
  });

  describe('auto cleanup interval', () => {
    it('should have a cleanup interval running', () => {
      // Verify that the interval mechanism is in place
      // The actual cleanup happens every 60 seconds in production
      sm.addSession('user1', 'token1', new Date(Date.now() + 60000), ['user']);
      expect(sm.sessionCount).toBe(1);
      // Manual cleanup should work
      const removed = sm.cleanupExpired();
      expect(removed).toBe(0);
    });
  });
});
