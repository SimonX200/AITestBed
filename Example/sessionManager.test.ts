import { SessionManager, UserSession } from './sessionManager';

// ---- Unit Tests ----

let sm: SessionManager;

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(`ASSERTION FAILED: ${msg}`);
}

function assertEquals<T>(actual: T, expected: T, msg: string): void {
  if (actual !== expected) throw new Error(`ASSERTION FAILED [${msg}]: expected ${expected}, got ${actual}`);
}

// Test 1: addSession & hasSession
{
  sm = new SessionManager();
  const future = new Date(Date.now() + 3600_000);
  sm.addSession('s1', 'tok1', future, ['admin', 'user']);
  assert(sm.hasSession('s1'), 's1 should exist');
  assert(!sm.hasSession('nonexistent'), 'nonexistent should not exist');
  console.log('✓ Test 1: addSession & hasSession');
}

// Test 2: getSession returns session data
{
  sm = new SessionManager();
  const future = new Date(Date.now() + 3600_000);
  const session = sm.addSession('s2', 'tok2', future, ['editor']);
  assert(session.id === 's2', 'returned session id should match');
  assert(session.roles.length === 1, 'should have 1 role');
  const retrieved = sm.getSession('s2');
  assert(retrieved !== undefined, 'getSession should return session');
  assert(retrieved!.token === 'tok2', 'token should match');
  console.log('✓ Test 2: getSession returns session data');
}

// Test 3: expired session is removed by cleanup
{
  sm = new SessionManager();
  const past = new Date(Date.now() - 1000);
  sm.addSession('s3', 'tok3', past, ['user']);
  const removed = sm.cleanupExpired();
  assert(removed === 1, 'should have removed 1 expired session');
  assert(!sm.hasSession('s3'), 'expired session should be gone');
  console.log('✓ Test 3: cleanupExpired removes expired sessions');
}

// Test 4: removeSession
{
  sm = new SessionManager();
  const future = new Date(Date.now() + 3600_000);
  sm.addSession('s4', 'tok4', future, ['user']);
  assert(sm.removeSession('s4'), 'removeSession should return true');
  assert(!sm.hasSession('s4'), 'session should be removed');
  assert(!sm.removeSession('s4'), 'removeSession should return false for missing');
  console.log('✓ Test 4: removeSession');
}

// Test 5: getAllSessions filters expired
{
  sm = new SessionManager();
  const future = new Date(Date.now() + 3600_000);
  const past = new Date(Date.now() - 1000);
  sm.addSession('s5a', 'tok5a', future, ['admin']);
  sm.addSession('s5b', 'tok5b', past, ['user']);
  const all = sm.getAllSessions();
  assert(all.length === 1, 'should return only 1 valid session');
  assert(all[0].id === 's5a', 'should be s5a');
  console.log('✓ Test 5: getAllSessions filters expired');
}

// Test 6: stop cleanup interval
{
  sm = new SessionManager();
  sm.stop();
  // No error on double stop
  sm.stop();
  console.log('✓ Test 6: stop cleanup interval');
}

// Test 7: auto-cleanup via setInterval (we speed it up by calling cleanupExpired manually)
{
  sm = new SessionManager();
  const past = new Date(Date.now() - 1000);
  sm.addSession('auto1', 'tok', past, ['user']);
  sm.addSession('auto2', 'tok2', new Date(Date.now() + 3600_000), ['admin']);
  const removed = sm.cleanupExpired();
  assert(removed === 1, 'auto cleanup should remove 1');
  assert(sm.getAllSessions().length === 1, 'only 1 session should remain');
  sm.stop();
  console.log('✓ Test 7: auto-cleanup behavior');
}

console.log('\n=== All unit tests passed ===\n');