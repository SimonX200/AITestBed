import { SessionManager, UserSession, createApp } from '../src/sessionManager';

// Mock ioredis to avoid actual Redis connection
class MockRedis {
  private store = new Map<string, string>();
  private sets = new Map<string, Set<string>>();

  async ping() { return 'PONG'; }
  async set(key: string, value: string) { this.store.set(key, value); return 'OK'; }
  async get(key: string) { return this.store.get(key) || null; }
  async del(key: string) { this.store.delete(key); return 1; }
  async sAdd(key: string, ...members: string[]) {
    if (!this.sets.has(key)) this.sets.set(key, new Set());
    members.forEach(m => this.sets.get(key)!.add(m));
    return members.length;
  }
  async sRem(key: string, ...members: string[]) {
    const set = this.sets.get(key);
    if (!set) return 0;
    members.forEach(m => set.delete(m));
    return members.length;
  }
  async sMembers(key: string) {
    const set = this.sets.get(key);
    return set ? Array.from(set) : [];
  }
  async quit() { this.store.clear(); this.sets.clear(); }
}

// Replace ioredis with mock
jest.mock('ioredis', () => {
  return {
    default: class { constructor() { return new MockRedis(); } },
  };
});

describe('SessionManager', () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager('redis://localhost:6379');
  });

  afterEach(async () => {
    await manager.close();
  });

  describe('createSession', () => {
    it('should create a session with default values', async () => {
      const session = await manager.createSession({ userId: 'user1' });
      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.token).toBeDefined();
      expect(session.roles).toEqual(['user']);
      expect(session.expiresAt).toBeInstanceOf(Date);
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should create a session with custom roles and duration', async () => {
      const session = await manager.createSession({
        userId: 'user2',
        roles: ['admin', 'editor'],
        durationMinutes: 30,
      });
      expect(session.roles).toEqual(['admin', 'editor']);
      const diff = session.expiresAt.getTime() - Date.now();
      expect(diff).toBeGreaterThan(29 * 60 * 1000);
      expect(diff).toBeLessThan(31 * 60 * 1000);
    });

    it('should generate unique session IDs', async () => {
      const s1 = await manager.createSession({ userId: 'user1' });
      const s2 = await manager.createSession({ userId: 'user2' });
      expect(s1.id).not.toBe(s2.id);
      expect(s1.token).not.toBe(s2.token);
    });
  });

  describe('getSession', () => {
    it('should retrieve an existing session', async () => {
      const session = await manager.createSession({ userId: 'user1' });
      const retrieved = await manager.getSession(session.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(session.id);
      expect(retrieved!.token).toBe(session.token);
    });

    it('should return null for non-existent session', async () => {
      const retrieved = await manager.getSession('non-existent-id');
      expect(retrieved).toBeNull();
    });
  });

  describe('validateSession', () => {
    it('should validate a correct session', async () => {
      const session = await manager.createSession({ userId: 'user1' });
      const valid = await manager.validateSession(session.id, session.token);
      expect(valid).toBe(true);
    });

    it('should reject wrong token', async () => {
      const session = await manager.createSession({ userId: 'user1' });
      const valid = await manager.validateSession(session.id, 'wrong-token');
      expect(valid).toBe(false);
    });

    it('should reject non-existent session', async () => {
      const valid = await manager.validateSession('non-existent', 'token');
      expect(valid).toBe(false);
    });
  });

  describe('deleteSession', () => {
    it('should delete an existing session', async () => {
      const session = await manager.createSession({ userId: 'user1' });
      const deleted = await manager.deleteSession(session.id);
      expect(deleted).toBe(true);
      const retrieved = await manager.getSession(session.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent session', async () => {
      const deleted = await manager.deleteSession('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('cleanupExpired', () => {
    it('should not remove non-expired sessions', async () => {
      const session = await manager.createSession({ userId: 'user1' });
      const count = await manager.cleanupExpired();
      expect(count).toBe(0);
      const retrieved = await manager.getSession(session.id);
      expect(retrieved).not.toBeNull();
    });

    it('should remove expired sessions from in-memory map', async () => {
      const session = await manager.createSession({ userId: 'user1', durationMinutes: 1 });
      // Manually expire the in-memory session
      (manager as any).inMemoryMap.set(session.id, {
        ...session,
        expiresAt: new Date(Date.now() - 60000),
      });
      const count = await manager.cleanupExpired();
      expect(count).toBeGreaterThanOrEqual(1);
      const retrieved = await manager.getSession(session.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('getAllSessions', () => {
    it('should return all active sessions', async () => {
      await manager.createSession({ userId: 'user1' });
      await manager.createSession({ userId: 'user2' });
      const sessions = await manager.getAllSessions();
      expect(sessions.length).toBe(2);
    });
  });
});
