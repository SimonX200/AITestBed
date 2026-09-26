import { UserSession, SessionManager } from '../src/sessionManager';

describe('SessionManager', () => {
  let manager: SessionManager;

  beforeEach(() => {
    // Use a non-existent Redis port to force memory-only mode
    manager = new SessionManager('redis://localhost:16379');
  });

  afterEach(async () => {
    await manager.close();
  }, 15000);

  describe('addSession', () => {
    it('should add a new session', async () => {
      const session: UserSession = {
        id: 'test-1',
        token: 'token-abc',
        expiresAt: new Date(Date.now() + 3600000),
        roles: ['user', 'admin'],
      };

      const result = await manager.addSession(session);
      expect(result).toEqual(session);
      expect(manager.getSessionCount()).toBe(1);
    });

    it('should add multiple sessions', async () => {
      const session1: UserSession = {
        id: 'test-1',
        token: 'token-1',
        expiresAt: new Date(Date.now() + 3600000),
        roles: ['user'],
      };
      const session2: UserSession = {
        id: 'test-2',
        token: 'token-2',
        expiresAt: new Date(Date.now() + 7200000),
        roles: ['admin'],
      };

      await manager.addSession(session1);
      await manager.addSession(session2);

      expect(manager.getSessionCount()).toBe(2);
    });
  });

  describe('checkSession', () => {
    it('should return session for valid session', async () => {
      const session: UserSession = {
        id: 'test-1',
        token: 'token-abc',
        expiresAt: new Date(Date.now() + 3600000),
        roles: ['user'],
      };

      await manager.addSession(session);
      const result = await manager.checkSession('test-1');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-1');
      expect(result?.token).toBe('token-abc');
    });

    it('should return null for non-existent session', async () => {
      const result = await manager.checkSession('non-existent');
      expect(result).toBeNull();
    });

    it('should return null for expired session', async () => {
      const session: UserSession = {
        id: 'expired-1',
        token: 'token-expired',
        expiresAt: new Date(Date.now() - 1000),
        roles: ['user'],
      };

      await manager.addSession(session);
      const result = await manager.checkSession('expired-1');
      expect(result).toBeNull();
    });
  });

  describe('deleteSession', () => {
    it('should delete an existing session', async () => {
      const session: UserSession = {
        id: 'test-1',
        token: 'token-abc',
        expiresAt: new Date(Date.now() + 3600000),
        roles: ['user'],
      };

      await manager.addSession(session);
      expect(manager.getSessionCount()).toBe(1);

      const deleted = await manager.deleteSession('test-1');
      expect(deleted).toBe(true);
      expect(manager.getSessionCount()).toBe(0);
    });

    it('should return false for non-existent session', async () => {
      const deleted = await manager.deleteSession('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('cleanupExpiredSessions', () => {
    it('should remove expired sessions', async () => {
      const validSession: UserSession = {
        id: 'valid-1',
        token: 'token-valid',
        expiresAt: new Date(Date.now() + 3600000),
        roles: ['user'],
      };
      const expiredSession: UserSession = {
        id: 'expired-1',
        token: 'token-expired',
        expiresAt: new Date(Date.now() - 1000),
        roles: ['user'],
      };

      await manager.addSession(validSession);
      await manager.addSession(expiredSession);
      expect(manager.getSessionCount()).toBe(2);

      const removed = await manager.cleanupExpiredSessions();
      expect(removed).toBe(1);
      expect(manager.getSessionCount()).toBe(1);
    });

    it('should not remove valid sessions', async () => {
      const session: UserSession = {
        id: 'valid-1',
        token: 'token-valid',
        expiresAt: new Date(Date.now() + 3600000),
        roles: ['user'],
      };

      await manager.addSession(session);
      const removed = await manager.cleanupExpiredSessions();
      expect(removed).toBe(0);
      expect(manager.getSessionCount()).toBe(1);
    });
  });

  describe('getAllSessions', () => {
    it('should return only valid sessions', async () => {
      const validSession: UserSession = {
        id: 'valid-1',
        token: 'token-valid',
        expiresAt: new Date(Date.now() + 3600000),
        roles: ['user'],
      };
      const expiredSession: UserSession = {
        id: 'expired-1',
        token: 'token-expired',
        expiresAt: new Date(Date.now() - 1000),
        roles: ['user'],
      };

      await manager.addSession(validSession);
      await manager.addSession(expiredSession);

      const sessions = await manager.getAllSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('valid-1');
    });
  });

  describe('getSession', () => {
    it('should return session without expiration check', async () => {
      const session: UserSession = {
        id: 'expired-1',
        token: 'token-expired',
        expiresAt: new Date(Date.now() - 1000),
        roles: ['user'],
      };

      await manager.addSession(session);
      const result = await manager.getSession('expired-1');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('expired-1');
    });
  });

  describe('isConnected', () => {
    it('should return false when Redis is not connected', async () => {
      const mgr = new SessionManager('redis://localhost:16379');
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(mgr.isConnected()).toBe(false);
      await mgr.close();
    });
  });

  describe('Session with Redis connection', () => {
    it('should work in memory-only mode', async () => {
      const session: UserSession = {
        id: 'mem-1',
        token: 'token-mem',
        expiresAt: new Date(Date.now() + 3600000),
        roles: ['user'],
      };

      await manager.addSession(session);
      const result = await manager.checkSession('mem-1');
      expect(result).not.toBeNull();
      expect(result?.token).toBe('token-mem');
    });
  });
});
