/**
 * Unit tests for SessionManager class.
 * Tests all core functionality without HTTP layer.
 */

import { SessionManager, UserSession } from './sessionManager';

describe('SessionManager', () => {
  let mgr: SessionManager;

  beforeEach(() => {
    mgr = new SessionManager();
  });

  afterEach(() => {
    mgr.stop();
  });

  describe('createSession', () => {
    it('should create a session with valid properties', () => {
      const session = mgr.createSession('user1', ['admin', 'user']);

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.token).toBeDefined();
      expect(session.token.length).toBeGreaterThan(0);
      expect(session.expiresAt).toBeInstanceOf(Date);
      expect(session.roles).toEqual(['admin', 'user']);
    });

    it('should generate unique session IDs', () => {
      const s1 = mgr.createSession('user1', ['user']);
      const s2 = mgr.createSession('user2', ['user']);

      expect(s1.id).not.toBe(s2.id);
    });

    it('should use default TTL of 1 hour', () => {
      const session = mgr.createSession('user1', ['user']);
      const expectedExpiry = new Date(Date.now() + 3_600_000);

      expect(session.expiresAt.getTime()).toBeCloseTo(
        expectedExpiry.getTime(),
        -2
      );
    });

    it('should respect custom TTL', () => {
      const session = mgr.createSession('user1', ['user'], 60_000);
      const expectedExpiry = new Date(Date.now() + 60_000);

      expect(session.expiresAt.getTime()).toBeCloseTo(
        expectedExpiry.getTime(),
        -2
      );
    });

    it('should store the session internally', () => {
      const session = mgr.createSession('user1', ['user']);
      const retrieved = mgr.getSession(session.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(session.id);
    });
  });

  describe('getSession', () => {
    it('should return undefined for non-existent session', () => {
      const result = mgr.getSession('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('should return the correct session', () => {
      const session = mgr.createSession('user1', ['admin']);
      const retrieved = mgr.getSession(session.id);

      expect(retrieved?.id).toBe(session.id);
      expect(retrieved?.token).toBe(session.token);
      expect(retrieved?.roles).toEqual(['admin']);
    });
  });

  describe('isValid', () => {
    it('should return true for a valid session', () => {
      const session = mgr.createSession('user1', ['user']);
      expect(mgr.isValid(session.id)).toBe(true);
    });

    it('should return false for non-existent session', () => {
      expect(mgr.isValid('non-existent-id')).toBe(false);
    });

    it('should return false for expired session', () => {
      const session = mgr.createSession('user1', ['user'], 1); // 1ms TTL
      // Wait for expiration
      const start = Date.now();
      while (Date.now() - start < 50) {
        // spin wait
      }
      expect(mgr.isValid(session.id)).toBe(false);
    });
  });

  describe('removeSession', () => {
    it('should remove an existing session', () => {
      const session = mgr.createSession('user1', ['user']);
      const result = mgr.removeSession(session.id);

      expect(result).toBe(true);
      expect(mgr.getSession(session.id)).toBeUndefined();
    });

    it('should return false for non-existent session', () => {
      const result = mgr.removeSession('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('getAllSessions', () => {
    it('should return all sessions including expired', () => {
      const s1 = mgr.createSession('user1', ['user']);
      const s2 = mgr.createSession('user2', ['admin']);

      // Create an almost-expired session
      const s3 = mgr.createSession('user3', ['user'], 1);
      const start = Date.now();
      while (Date.now() - start < 50) {}

      const all = mgr.getAllSessions();
      expect(all).toHaveLength(3);
    });

    it('should return empty array when no sessions exist', () => {
      const all = mgr.getAllSessions();
      expect(all).toHaveLength(0);
    });
  });

  describe('getActiveSessions', () => {
    it('should return only non-expired sessions', () => {
      const s1 = mgr.createSession('user1', ['user']);
      const s2 = mgr.createSession('user2', ['admin'], 1);

      const start = Date.now();
      while (Date.now() - start < 50) {}

      const active = mgr.getActiveSessions();
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe(s1.id);
    });
  });

  describe('cleanupExpired', () => {
    it('should remove expired sessions', () => {
      const s1 = mgr.createSession('user1', ['user']);
      const s2 = mgr.createSession('user2', ['admin'], 1);

      const start = Date.now();
      while (Date.now() - start < 50) {}

      const removed = mgr.cleanupExpired();
      expect(removed).toBe(1);
      expect(mgr.getAllSessions()).toHaveLength(1);
      expect(mgr.getSession(s1.id)).toBeDefined();
      expect(mgr.getSession(s2.id)).toBeUndefined();
    });

    it('should return 0 when no sessions are expired', () => {
      mgr.createSession('user1', ['user']);
      const removed = mgr.cleanupExpired();
      expect(removed).toBe(0);
    });
  });

  describe('clear', () => {
    it('should remove all sessions', () => {
      mgr.createSession('user1', ['user']);
      mgr.createSession('user2', ['admin']);
      mgr.clear();

      expect(mgr.getAllSessions()).toHaveLength(0);
    });
  });

  describe('stop', () => {
    it('should stop the cleanup interval', () => {
      // Create many short-lived sessions
      for (let i = 0; i < 10; i++) {
        mgr.createSession(`user${i}`, ['user'], 1);
      }

      mgr.stop();

      // Wait longer than cleanup interval
      const start = Date.now();
      while (Date.now() - start < 700) {}

      // Sessions should still be there since cleanup stopped
      expect(mgr.getAllSessions().length).toBeGreaterThan(0);
    });
  });
});
