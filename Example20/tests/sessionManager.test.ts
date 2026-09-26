import { SessionManager, SQLiteStorage, UserSession } from '../src/sessionManager';
import * as fs from 'fs';

// Helper to clean up db files
function cleanupDb(testDb: string): void {
  if (fs.existsSync(testDb)) fs.unlinkSync(testDb);
  const wal = testDb + '-wal';
  if (fs.existsSync(wal)) fs.unlinkSync(wal);
  const shm = testDb + '-shm';
  if (fs.existsSync(shm)) fs.unlinkSync(shm);
}

describe('SQLiteStorage', () => {
  let storage: SQLiteStorage;
  const testDb = '/tmp/test-sessions-' + Date.now() + '.db';

  beforeEach(async () => {
    cleanupDb(testDb);
    storage = new SQLiteStorage(testDb);
    await storage.init();
  });

  afterEach(async () => {
    await storage.close();
    cleanupDb(testDb);
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
    expect(all).toHaveLength(2);
    expect(all.some((s: UserSession) => s.id === 'active-1')).toBe(true);
    expect(all.some((s: UserSession) => s.id === 'expired')).toBe(false);
  });

  test('should delete a session', async () => {
    await storage.save({ id: 'del-1', token: 't1', expiresAt: new Date(Date.now() + 3600000), roles: [] });
    expect(await storage.deleteById('del-1')).toBe(true);
    expect(await storage.findById('del-1')).toBeNull();
    expect(await storage.deleteById('non-existent')).toBe(false);
  });

  test('should cleanup expired sessions', async () => {
    const now = Date.now();
    await storage.save({ id: 'exp-1', token: 't1', expiresAt: new Date(now - 1000), roles: [] });
    await storage.save({ id: 'exp-2', token: 't2', expiresAt: new Date(now - 500), roles: [] });
    await storage.save({ id: 'active', token: 't3', expiresAt: new Date(now + 3600000), roles: [] });

    const removed = await storage.cleanupExpired();
    expect(removed).toBe(2);
    expect(await storage.findById('active')).not.toBeNull();
    expect(await storage.findById('exp-1')).toBeNull();
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
});

describe('SessionManager', () => {
  let manager: SessionManager;
  const testDb = '/tmp/test-sm-sessions-' + Date.now() + '.db';

  beforeEach(async () => {
    cleanupDb(testDb);
    manager = new SessionManager({ dbPath: testDb, loadFromDisk: false });
    await manager.init();
  });

  afterEach(async () => {
    await manager.dispose();
    cleanupDb(testDb);
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
    manager.createSession('user2', ['user'], 2);
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

  test('should persist sessions to disk and reload', async () => {
    await manager.createSession('user1', ['admin'], 1);
    await manager.dispose();

    const freshManager = new SessionManager({ dbPath: testDb, loadFromDisk: true });
    await freshManager.init();
    const loadedSessions = freshManager.listSessions();
    expect(loadedSessions.length).toBeGreaterThanOrEqual(1);
    expect(loadedSessions[0].roles).toEqual(['admin']);
    await freshManager.dispose();
  });

  test('should return express app', async () => {
    const app = manager.getApp();
    expect(app).toBeDefined();
  });
});
