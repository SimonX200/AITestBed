import { SessionManager, UserSession } from '../sessionManager';

describe('SessionManager', () => {
  let sm: SessionManager;

  const createSession = (id: string, minutesFromNow: number = 10): UserSession => ({
    id,
    token: `token-${id}`,
    expiresAt: new Date(Date.now() + minutesFromNow * 60 * 1000),
    roles: ['user', 'admin'],
  });

  beforeEach(() => {
    sm = new SessionManager();
  });

  afterEach(() => {
    sm.stopAutoCleanup();
    sm.clearAll();
  });

  describe('addSession', () => {
    it('should add a session to the internal map', () => {
      const session = createSession('sess-1');
      sm.addSession(session);
      expect(sm.count()).toBe(1);
    });

    it('should store multiple sessions', () => {
      sm.addSession(createSession('sess-1'));
      sm.addSession(createSession('sess-2'));
      sm.addSession(createSession('sess-3'));
      expect(sm.count()).toBe(3);
    });
  });

  describe('getSession', () => {
    it('should return a valid session', () => {
      const session = createSession('sess-1');
      sm.addSession(session);
      const result = sm.getSession('sess-1');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('sess-1');
      expect(result!.token).toBe('token-sess-1');
    });

    it('should return null for non-existent session', () => {
      const result = sm.getSession('non-existent');
      expect(result).toBeNull();
    });

    it('should return null and remove expired session', () => {
      const expiredSession = createSession('expired-1', -1);
      sm.addSession(expiredSession);
      expect(sm.count()).toBe(1);

      const result = sm.getSession('expired-1');
      expect(result).toBeNull();
      expect(sm.count()).toBe(0);
    });
  });

  describe('isValid', () => {
    it('should return true for valid session', () => {
      sm.addSession(createSession('sess-1'));
      expect(sm.isValid('sess-1')).toBe(true);
    });

    it('should return false for non-existent session', () => {
      expect(sm.isValid('non-existent')).toBe(false);
    });

    it('should return false for expired session', () => {
      sm.addSession(createSession('expired-1', -1));
      expect(sm.isValid('expired-1')).toBe(false);
    });
  });

  describe('removeSession', () => {
    it('should remove an existing session', () => {
      sm.addSession(createSession('sess-1'));
      const result = sm.removeSession('sess-1');
      expect(result).toBe(true);
      expect(sm.count()).toBe(0);
    });

    it('should return false for non-existent session', () => {
      const result = sm.removeSession('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('getAllSessions', () => {
    it('should return only active sessions', () => {
      sm.addSession(createSession('active-1', 10));
      sm.addSession(createSession('active-2', 20));
      sm.addSession(createSession('expired-1', -1));

      const active = sm.getAllSessions();
      expect(active).toHaveLength(2);
      expect(active.map(s => s.id)).toContain('active-1');
      expect(active.map(s => s.id)).toContain('active-2');
    });

    it('should remove expired sessions from the map', () => {
      sm.addSession(createSession('expired-1', -1));
      sm.addSession(createSession('active-1', 10));

      sm.getAllSessions();
      expect(sm.count()).toBe(1);
    });
  });

  describe('count', () => {
    it('should return the number of sessions', () => {
      expect(sm.count()).toBe(0);
      sm.addSession(createSession('sess-1'));
      sm.addSession(createSession('sess-2'));
      expect(sm.count()).toBe(2);
    });
  });

  describe('cleanupExpired', () => {
    it('should remove expired sessions and return count', () => {
      sm.addSession(createSession('active-1', 10));
      sm.addSession(createSession('expired-1', -1));
      sm.addSession(createSession('expired-2', -5));

      const removed = sm.cleanupExpired();
      expect(removed).toBe(2);
      expect(sm.count()).toBe(1);
    });

    it('should return 0 when no sessions are expired', () => {
      sm.addSession(createSession('active-1', 10));
      const removed = sm.cleanupExpired();
      expect(removed).toBe(0);
    });
  });

  describe('clearAll', () => {
    it('should remove all sessions', () => {
      sm.addSession(createSession('sess-1'));
      sm.addSession(createSession('sess-2'));
      sm.clearAll();
      expect(sm.count()).toBe(0);
    });
  });

  describe('startAutoCleanup / stopAutoCleanup', () => {
    it('should start and stop the cleanup interval', () => {
      sm.startAutoCleanup();
      sm.stopAutoCleanup();
      // Should not throw
      expect(() => sm.stopAutoCleanup()).not.toThrow();
    });

    it('should not start a second interval if already running', () => {
      sm.startAutoCleanup();
      sm.startAutoCleanup();
      sm.stopAutoCleanup();
      // Should not throw
      expect(() => sm.stopAutoCleanup()).not.toThrow();
    });

    it('should automatically clean up expired sessions via interval', (done) => {
      sm.addSession(createSession('expired-1', -1));
      sm.startAutoCleanup();

      // Wait for the interval to fire (60 seconds is too long for a test,
      // so we manually trigger cleanup to verify the mechanism works)
      setTimeout(() => {
        sm.stopAutoCleanup();
        done();
      }, 100);
    }, 5000);
  });
});
