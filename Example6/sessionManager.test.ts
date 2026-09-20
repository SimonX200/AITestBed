import { SessionManager, UserSession } from './sessionManager';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}`);
    failed++;
  }
}

async function runTests(): Promise<void> {
  // ── Test: addSession & hasSession ──────────────────────────
  console.log('\n📦 Test: addSession & hasSession');
  {
    const sm = new SessionManager();
    const session: UserSession = {
      id: 'sess-1',
      token: 'tok-abc',
      expiresAt: new Date(Date.now() + 60_000),
      roles: ['admin', 'user'],
    };
    sm.addSession(session);
    assert(sm.hasSession('sess-1'), 'hasSession returns true for valid session');
    assert(sm.hasSession('nonexistent') === false, 'hasSession returns false for missing session');
    assert(sm.getSessionCount() === 1, 'getSessionCount returns 1');
  }

  // ── Test: getSession returns session data ──────────────────
  console.log('\n📦 Test: getSession returns session data');
  {
    const sm = new SessionManager();
    const session: UserSession = {
      id: 'sess-2',
      token: 'tok-xyz',
      expiresAt: new Date(Date.now() + 60_000),
      roles: ['editor'],
    };
    sm.addSession(session);
    const got = sm.getSession('sess-2');
    assert(got !== undefined, 'getSession returns the session');
    assert(got!.id === 'sess-2', 'session id matches');
    assert(got!.token === 'tok-xyz', 'session token matches');
    assert(got!.roles.length === 1, 'session roles array correct');
  }

  // ── Test: expired session is not returned ──────────────────
  console.log('\n📦 Test: expired session is not returned');
  {
    const sm = new SessionManager();
    const expired: UserSession = {
      id: 'sess-expired',
      token: 'tok-old',
      expiresAt: new Date(Date.now() - 1_000),
      roles: [],
    };
    sm.addSession(expired);
    assert(sm.hasSession('sess-expired') === false, 'hasSession returns false for expired session');
    assert(sm.getSession('sess-expired') === undefined, 'getSession returns undefined for expired session');
  }

  // ── Test: removeSession ────────────────────────────────────
  console.log('\n📦 Test: removeSession');
  {
    const sm = new SessionManager();
    const session: UserSession = {
      id: 'sess-remove',
      token: 'tok-rm',
      expiresAt: new Date(Date.now() + 60_000),
      roles: ['user'],
    };
    sm.addSession(session);
    assert(sm.removeSession('sess-remove') === true, 'removeSession returns true');
    assert(sm.hasSession('sess-remove') === false, 'session is gone after removal');
    assert(sm.removeSession('sess-remove') === false, 'removeSession returns false for missing session');
  }

  // ── Test: cleanupExpired ───────────────────────────────────
  console.log('\n📦 Test: cleanupExpired');
  {
    const sm = new SessionManager();
    sm.addSession({ id: 's1', token: 't1', expiresAt: new Date(Date.now() - 1_000), roles: [] });
    sm.addSession({ id: 's2', token: 't2', expiresAt: new Date(Date.now() + 60_000), roles: [] });
    sm.addSession({ id: 's3', token: 't3', expiresAt: new Date(Date.now() - 2_000), roles: [] });
    const removed = sm.cleanupExpired();
    assert(removed === 2, `cleanupExpired removed 2 sessions (got ${removed})`);
    assert(sm.getSessionCount() === 1, 'Only 1 session remains');
    assert(sm.hasSession('s2'), 'Valid session still present');
  }

  // ── Test: getAllSessions ───────────────────────────────────
  console.log('\n📦 Test: getAllSessions');
  {
    const sm = new SessionManager();
    sm.addSession({ id: 'a', token: 't1', expiresAt: new Date(Date.now() + 60_000), roles: ['r1'] });
    sm.addSession({ id: 'b', token: 't2', expiresAt: new Date(Date.now() + 60_000), roles: ['r2'] });
    const all = sm.getAllSessions();
    assert(all.length === 2, 'getAllSessions returns 2 sessions');
    assert(all.every((s) => s.expiresAt > new Date()), 'all returned sessions are not expired');
  }

  // ── Test: startAutoCleanup / stopAutoCleanup ───────────────
  console.log('\n📦 Test: startAutoCleanup / stopAutoCleanup');
  {
    const sm = new SessionManager();
    sm.addSession({ id: 'auto-exp', token: 't', expiresAt: new Date(Date.now() + 50), roles: [] });
    sm.startAutoCleanup();
    await new Promise((r) => setTimeout(r, 1500));
    assert(sm.hasSession('auto-exp') === false, 'autoCleanup removed expired session after 1.5s');
    sm.stopAutoCleanup();
  }

  // ── Summary ────────────────────────────────────────────────
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
  console.log('All tests passed! ✅');
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
