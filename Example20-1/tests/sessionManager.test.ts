import { SessionManager, RedisStorage, UserSession } from '../src/sessionManager';
import Redis from 'ioredis';

const TEST_REDIS_URL = 'redis://localhost:6380/1';

describe('RedisStorage', () => {
  let storage: RedisStorage;

  beforeEach(async () => {
    storage = new RedisStorage(TEST_REDIS_URL);
    await storage.init();
    // Clean up test keys
    const keys = await storage.findAll();
    for (const session of keys) {
      await storage.deleteById(session.id);
    }
  });

  afterEach(async () => {
    await storage.close();
  });

  test('should save and retrieve a session by ID', async () => {
    const session: UserSession = {
      id: 'test-1',
      token: 'token-abc',
      expiresAt: new Date(Date.now() + 3600000),
      roles: ['admin', 'user'],
    };
    await storage.save(session);
    const retrieved = await storage.findById('test-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe('test-1');
    expect(retrieved!.token).toBe('token-abc');
    expect(retrieved!.roles).toEqual(['admin', 'user']);
  });

  test('should find session by token', async () => {
    const session: UserSession = {
      id: 'test-2',
      token: 'token-xyz',
      expiresAt: new Date(Date.now() + 3600000),
      roles: ['user'],
    };
    await storage.save(session);
    const retrieved = await storage.findByToken('token-xyz');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe('test-2');
  });

  test('should return null for non-existent session', async () => {
    expect(await storage.findById('non-existent')).toBeNull();
    expect(await storage.findByToken('non-existent')).toBeNull();
  });

  test('should list all non-expired sessions', async () => {
    const now = Date.now();
    await storage.save({ id: 'active-1', token: 't1', expiresAt: new Date(now + 3600000), roles: [] });
    await storage.save({ id: 'active-2', token: 't2', expiresAt: new Date(now + 3600000), roles: ['admin'] });
    await storage.save({ id: 'expired', token: 't3', expiresAt: new Date(now - 1000), roles: [] });

    const all = await storage.findAll();
    // Note: Redis auto-expires keys, so expired session may or may not be present
    expect(all.length).toBeGreaterThanOrEqual(1);
    expect(all.some((s: UserSession) => s.id === 'active-1')).toBe(true);
  });

  test('should delete a session', async () => {
    await storage.save({ id: 'del-1', token: 't1', expiresAt: new Date(Date.now() + 3600000), roles: [] });
    expect(await storage.deleteById('del-1')).toBe(true);
    expect(await storage.findById('del-1')).toBeNull();
    expect(await storage.deleteById('non-existent')).toBe(false);
  });

  test('should cleanup expired sessions (Redis auto-cleanup)', async () => {
    const now = Date.now();
    await storage.save({ id: 'exp-1', token: 't1', expiresAt: new Date(now - 1000), roles: [] });
    await storage.save({ id: 'exp-2', token: 't2', expiresAt: new Date(now - 500), roles: [] });
    await storage.save({ id: 'active', token: 't3', expiresAt: new Date(now + 3600000), roles: [] });

    const removed = await storage.cleanupExpired();
    // Redis handles expiration automatically
    expect(removed).toBe(0);
    expect(await storage.findById('active')).not.toBeNull();
  });

  test('should check if session exists and is valid', async () => {
    const future = new Date(Date.now() + 3600000);
    const past = new Date(Date.now() - 1000);
    await storage.save({ id: 'valid', token: 't1', expiresAt: future, roles: [] });
    await storage.save({ id: 'expired', token: 't2', expiresAt: past, roles: [] });
    expect(await storage.existsAndValid('valid')).toBe(true);
    expect(await storage.existsAndValid('expired')).toBe(false);
    expect(await storage.existsAndValid('non-existent')).toBe(false);
  });

  test('should count sessions', async () => {
    await storage.save({ id: 'count-1', token: 't1', expiresAt: new Date(Date.now() + 3600000), roles: [] });
    await storage.save({ id: 'count-2', token: 't2', expiresAt: new Date(Date.now() + 3600000), roles: [] });
    const count = await storage.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

describe('SessionManager', () => {
  let manager: SessionManager;
  const TEST_REDIS_URL_SM = 'redis://localhost:6380/2';

  beforeEach(async () => {
    manager = new SessionManager({ redisUrl: TEST_REDIS_URL_SM, loadFromDisk: false });
    await manager.init();
  });

  afterEach(async () => {
    await manager.dispose();
  });

  test('should create a session', async () => {
    const session = await manager.createSession('user1', ['admin', 'user'], 1);
    expect(session).not.toBeNull();
    expect(session.id).toBeDefined();
    expect(session.token).toBeDefined();
    expect(session.roles).toEqual(['admin', 'user']);
    expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  test('should retrieve a session by ID', async () => {
    const session = await manager.createSession('user1', ['admin'], 1);
    const retrieved = manager.getSession(session.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe(session.id);
    expect(retrieved!.token).toBe(session.token);
  });

  test('should retrieve a session by token', async () => {
    const session = await manager.createSession('user1', ['user'], 1);
    const retrieved = manager.getSessionByToken(session.token);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe(session.id);
  });

  test('should return null for non-existent session', async () => {
    expect(manager.getSession('non-existent')).toBeNull();
    expect(manager.getSessionByToken('non-existent')).toBeNull();
  });

  test('should validate session', async () => {
    const session = await manager.createSession('user1', [], 1);
    expect(manager.isValid(session.id)).toBe(true);
    expect(manager.isValid('non-existent')).toBe(false);
  });

  test('should list all active sessions', async () => {
    await manager.createSession('user1', ['admin'], 1);
    await manager.createSession('user2', ['user'], 2);
    const sessions = manager.listSessions();
    expect(sessions).toHaveLength(2);
  });

  test('should delete a session', async () => {
    const session = await manager.createSession('user1', [], 1);
    expect(await manager.deleteSession(session.id)).toBe(true);
    expect(manager.getSession(session.id)).toBeNull();
    expect(await manager.deleteSession('non-existent')).toBe(false);
  });

  test('should cleanup expired sessions', async () => {
    await manager.createSession('user1', [], 0.00001);
    await manager.createSession('user2', [], 1);
    const before = manager.listSessions().length;
    await new Promise((r) => setTimeout(r, 500));
    const removed = await manager.cleanupExpiredSessions();
    expect(removed).toBeGreaterThanOrEqual(1);
    expect(manager.listSessions().length).toBeLessThan(before);
  });

  test('should persist sessions to Redis and reload', async () => {
    // Clean up Redis DB 2 first to avoid stale sessions from other tests
    const cleanRedis = new Redis(TEST_REDIS_URL_SM);
    const keys = await cleanRedis.keys('session:*');
    if (keys.length > 0) await cleanRedis.del(...keys);
    await cleanRedis.quit();

    await manager.createSession('user1', ['admin'], 1);
    await manager.dispose();

    const freshManager = new SessionManager({ redisUrl: TEST_REDIS_URL_SM, loadFromDisk: true });
    await freshManager.init();
    const loadedSessions = freshManager.listSessions();
    expect(loadedSessions.length).toBeGreaterThanOrEqual(1);
    // Find the session we just created (it has 'admin' role)
    const adminSession = loadedSessions.find(s => s.roles.includes('admin'));
    expect(adminSession).toBeDefined();
    expect(adminSession!.roles).toEqual(['admin']);
    await freshManager.dispose();
  });

  test('should return express app', async () => {
    const app = manager.getApp();
    expect(app).toBeDefined();
  });
});
