const { SessionManager } = require('../dist/sessionManager.cjs');

describe('SessionManager', () => {
  let sm;

  beforeEach(() => {
    sm = new SessionManager();
    sm.stopAutoCleanup();
  });

  afterEach(() => {
    sm.stopAutoCleanup();
  });

  test('addSession and getSession return the same session', () => {
    const session = {
      id: 's1',
      token: 'tok-abc',
      expiresAt: new Date(Date.now() + 60000),
      roles: ['admin', 'user'],
    };
    sm.addSession(session);
    const got = sm.getSession('s1');
    expect(got).not.toBeNull();
    expect(got.id).toBe('s1');
    expect(got.token).toBe('tok-abc');
    expect(got.roles).toEqual(['admin', 'user']);
  });

  test('getSession returns null for unknown id', () => {
    expect(sm.getSession('nonexistent')).toBeNull();
  });

  test('getSession returns null for expired session', () => {
    const session = {
      id: 's-expired',
      token: 'tok-exp',
      expiresAt: new Date(Date.now() - 1000),
      roles: [],
    };
    sm.addSession(session);
    expect(sm.getSession('s-expired')).toBeNull();
  });

  test('removeSession removes the session', () => {
    sm.addSession({
      id: 's2',
      token: 'tok2',
      expiresAt: new Date(Date.now() + 60000),
      roles: [],
    });
    expect(sm.removeSession('s2')).toBe(true);
    expect(sm.getSession('s2')).toBeNull();
  });

  test('removeSession returns false for unknown id', () => {
    expect(sm.removeSession('nope')).toBe(false);
  });

  test('getAllSessions returns only active sessions', () => {
    sm.addSession({
      id: 'a',
      token: 'ta',
      expiresAt: new Date(Date.now() + 60000),
      roles: [],
    });
    sm.addSession({
      id: 'b',
      token: 'tb',
      expiresAt: new Date(Date.now() - 1000),
      roles: [],
    });
    const active = sm.getAllSessions();
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe('a');
  });

  test('getSessionCount returns total including expired', () => {
    sm.addSession({
      id: 'c',
      token: 'tc',
      expiresAt: new Date(Date.now() + 60000),
      roles: [],
    });
    sm.addSession({
      id: 'd',
      token: 'td',
      expiresAt: new Date(Date.now() - 1000),
      roles: [],
    });
    expect(sm.getSessionCount()).toBe(2);
  });

  test('cleanupExpired removes only expired sessions and returns count', () => {
    sm.addSession({
      id: 'e1',
      token: 'te1',
      expiresAt: new Date(Date.now() + 60000),
      roles: [],
    });
    sm.addSession({
      id: 'e2',
      token: 'te2',
      expiresAt: new Date(Date.now() - 1000),
      roles: [],
    });
    sm.addSession({
      id: 'e3',
      token: 'te3',
      expiresAt: new Date(Date.now() - 500),
      roles: [],
    });
    const removed = sm.cleanupExpired();
    expect(removed).toBe(2);
    expect(sm.getSessionCount()).toBe(1);
    expect(sm.getSession('e1')).not.toBeNull();
  });

  test('clearAll removes all sessions', () => {
    sm.addSession({
      id: 'f1',
      token: 'tf1',
      expiresAt: new Date(Date.now() + 60000),
      roles: [],
    });
    sm.addSession({
      id: 'f2',
      token: 'tf2',
      expiresAt: new Date(Date.now() + 60000),
      roles: [],
    });
    sm.clearAll();
    expect(sm.getSessionCount()).toBe(0);
    expect(sm.getAllSessions()).toHaveLength(0);
  });

  test('startAutoCleanup and stopAutoCleanup work', () => {
    sm.startAutoCleanup();
    expect(sm.getSessionCount()).toBe(0);
    sm.stopAutoCleanup();
    sm.stopAutoCleanup(); // no-op, no error
  });

  test('auto-cleanup does not throw', (done) => {
    sm.addSession({
      id: 'auto-exp',
      token: 'tauto',
      expiresAt: new Date(Date.now() - 1000),
      roles: [],
    });
    sm.startAutoCleanup();
    setTimeout(() => {
      sm.stopAutoCleanup();
      expect(sm.getSessionCount()).toBe(1); // 100ms < 60s interval
      done();
    }, 100);
  }, 10000);
});