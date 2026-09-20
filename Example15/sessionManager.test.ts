import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SessionManager, UserSession } from './sessionManager';

describe('SessionManager', () => {
  let sm: SessionManager;

  beforeEach(() => {
    sm = new SessionManager(60_000);
  });

  afterEach(() => {
    sm.stopAutoCleanup();
  });

  describe('addSession', () => {
    it('should add a new session and return it', () => {
      const session = sm.addSession('user1', 'token123', new Date(Date.now() + 3600000), ['admin', 'user']);
      expect(session).toBeDefined();
      expect(session.id).toBe('user1');
      expect(session.token).toBe('token123');
      expect(session.roles).toEqual(['admin', 'user']);
    });

    it('should store session in internal map', () => {
      sm.addSession('user1', 'token123', new Date(Date.now() + 3600000), ['user']);
      expect(sm.getSessionCount()).toBe(1);
    });
  });

  describe('getSession', () => {
    it('should return session by id', () => {
      sm.addSession('user1', 'token123', new Date(Date.now() + 3600000), ['user']);
      const session = sm.getSession('user1');
      expect(session).toBeDefined();
      expect(session!.id).toBe('user1');
    });

    it('should return undefined for non-existent session', () => {
      const session = sm.getSession('nonexistent');
      expect(session).toBeUndefined();
    });
  });

  describe('isValidSession', () => {
    it('should return true for valid session', () => {
      sm.addSession('user1', 'token123', new Date(Date.now() + 3600000), ['user']);
      expect(sm.isValidSession('user1')).toBe(true);
    });

    it('should return false for non-existent session', () => {
      expect(sm.isValidSession('nonexistent')).toBe(false);
    });

    it('should return false for expired session', () => {
      sm.addSession('user1', 'token123', new Date(Date.now() - 1000), ['user']);
      expect(sm.isValidSession('user1')).toBe(false);
    });

    it('should remove expired session from map', () => {
      sm.addSession('user1', 'token123', new Date(Date.now() - 1000), ['user']);
      sm.isValidSession('user1');
      expect(sm.getSessionCount()).toBe(0);
    });
  });

  describe('hasRole', () => {
    it('should return true if user has the role', () => {
      sm.addSession('user1', 'token123', new Date(Date.now() + 3600000), ['admin', 'user']);
      expect(sm.hasRole('user1', 'admin')).toBe(true);
    });

    it('should return false if user does not have the role', () => {
      sm.addSession('user1', 'token123', new Date(Date.now() + 3600000), ['user']);
      expect(sm.hasRole('user1', 'admin')).toBe(false);
    });

    it('should return false for non-existent session', () => {
      expect(sm.hasRole('nonexistent', 'admin')).toBe(false);
    });

    it('should return false for expired session', () => {
      sm.addSession('user1', 'token123', new Date(Date.now() - 1000), ['admin']);
      expect(sm.hasRole('user1', 'admin')).toBe(false);
    });
  });

  describe('removeSession', () => {
    it('should remove an existing session', () => {
      sm.addSession('user1', 'token123', new Date(Date.now() + 3600000), ['user']);
      const result = sm.removeSession('user1');
      expect(result).toBe(true);
      expect(sm.getSessionCount()).toBe(0);
    });

    it('should return false for non-existent session', () => {
      const result = sm.removeSession('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('cleanupExpired', () => {
    it('should remove all expired sessions', () => {
      sm.addSession('user1', 'token1', new Date(Date.now() - 1000), ['user']);
      sm.addSession('user2', 'token2', new Date(Date.now() + 3600000), ['user']);
      sm.addSession('user3', 'token3', new Date(Date.now() - 500), ['user']);
      const removed = sm.cleanupExpired();
      expect(removed).toBe(2);
      expect(sm.getSessionCount()).toBe(1);
      expect(sm.getSession('user2')).toBeDefined();
    });

    it('should return 0 when no sessions are expired', () => {
      sm.addSession('user1', 'token1', new Date(Date.now() + 3600000), ['user']);
      const removed = sm.cleanupExpired();
      expect(removed).toBe(0);
    });
  });

  describe('getAllSessions', () => {
    it('should return only active sessions', () => {
      sm.addSession('user1', 'token1', new Date(Date.now() + 3600000), ['user']);
      sm.addSession('user2', 'token2', new Date(Date.now() - 1000), ['user']);
      sm.addSession('user3', 'token3', new Date(Date.now() + 7200000), ['admin']);
      const sessions = sm.getAllSessions();
      expect(sessions).toHaveLength(2);
      const ids = sessions.map(s => s.id);
      expect(ids).toContain('user1');
      expect(ids).toContain('user3');
      expect(ids).not.toContain('user2');
    });
  });

  describe('getAllSessionsRaw', () => {
    it('should return all sessions including expired', () => {
      sm.addSession('user1', 'token1', new Date(Date.now() + 3600000), ['user']);
      sm.addSession('user2', 'token2', new Date(Date.now() - 1000), ['user']);
      const sessions = sm.getAllSessionsRaw();
      expect(sessions).toHaveLength(2);
    });
  });

  describe('auto cleanup interval', () => {
    it('should auto-remove expired sessions after interval', async () => {
      // Create a SessionManager with a very short interval for testing
      const shortSm = new SessionManager(100);
      shortSm.addSession('user1', 'token1', new Date(Date.now() - 1000), ['user']);
      
      await new Promise(resolve => setTimeout(resolve, 250));
      
      expect(shortSm.getSessionCount()).toBe(0);
      shortSm.stopAutoCleanup();
    });
  });

  describe('stopAutoCleanup', () => {
    it('should stop the cleanup interval', () => {
      sm.stopAutoCleanup();
      sm.addSession('user1', 'token1', new Date(Date.now() - 1000), ['user']);
      // Should not be cleaned up since interval is stopped
      expect(sm.getSessionCount()).toBe(1);
    });
  });
});
