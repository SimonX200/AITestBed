import { SessionManager, UserSession } from './sessionManager';

// ---- Unit Tests ----

let sm: SessionManager;

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(`ASSERTION FAILED: ${msg}`);
}

function assertEquals<T>(actual: T, expected: T, msg: string): void {
  if (actual !== expected) {
    throw new Error(`ASSERTION FAILED [${msg}]: expected ${expected}, got ${actual}`);
  }
}

// Test 1: addSession creates a valid session
function testAddSession(): void {
  sm = new SessionManager();
  const session = sm.addSession('user-1', 'tok-abc', 60_000, ['admin', 'editor']);
  assert(session.id === 'user-1', 'id mismatch');
  assert(session.token === 'tok-abc', 'token mismatch');
  assert(session.roles.length === 2, 'roles length mismatch');
  assert(sm.getSessionCount() === 1, 'count should be 1');
  sm.stop();
  console.log('  ✓ testAddSession');
}

// Test 2: hasSession returns true for valid session
function testHasSession(): void {
  sm = new SessionManager();
  sm.addSession('user-2', 'tok-def', 60_000);
  assert(sm.hasSession('user-2') === true, 'should have session');
  assert(sm.hasSession('nonexistent') === false, 'should not have nonexistent');
  sm.stop();
  console.log('  ✓ testHasSession');
}

// Test 3: getSession returns session data
function testGetSession(): void {
  sm = new SessionManager();
  sm.addSession('user-3', 'tok-ghi', 60_000, ['viewer']);
  const session = sm.getSession('user-3');
  assert(session !== undefined, 'session should exist');
  assert(session!.roles.includes('viewer'), 'should have viewer role');
  sm.stop();
  console.log('  ✓ testGetSession');
}

// Test 4: expired session is removed
function testExpiredSession(): void {
  sm = new SessionManager();
  sm.addSession('user-4', 'tok-jkl', 100); // 100ms TTL
  // Wait for expiry
  const start = Date.now();
  while (Date.now() - start < 200) { /* spin wait */ }
  assert(sm.hasSession('user-4') === false, 'session should be expired');
  sm.stop();
  console.log('  ✓ testExpiredSession');
}

// Test 5: removeSession works
function testRemoveSession(): void {
  sm = new SessionManager();
  sm.addSession('user-5', 'tok-mno', 60_000);
  assert(sm.removeSession('user-5') === true, 'remove should return true');
  assert(sm.hasSession('user-5') === false, 'session should be gone');
  assert(sm.removeSession('user-5') === false, 'double remove should return false');
  sm.stop();
  console.log('  ✓ testRemoveSession');
}

// Test 6: cleanupExpired removes expired sessions
function testCleanupExpired(): void {
  sm = new SessionManager();
  sm.addSession('exp-1', 'tok-a', 100);
  sm.addSession('exp-2', 'tok-b', 100);
  sm.addSession('valid-1', 'tok-c', 60_000);
  const start = Date.now();
  while (Date.now() - start < 200) { /* spin wait */ }
  const removed = sm.cleanupExpired();
  assert(removed === 2, `expected 2 removed, got ${removed}`);
  assert(sm.getSessionCount() === 1, 'only valid session should remain');
  sm.stop();
  console.log('  ✓ testCleanupExpired');
}

// Test 7: stop clears interval
function testStop(): void {
  sm = new SessionManager();
  sm.stop();
  // Should not throw
  sm.stop();
  console.log('  ✓ testStop');
}

// Run all unit tests
console.log('\n=== Unit Tests ===');
try {
  testAddSession();
  testHasSession();
  testGetSession();
  testExpiredSession();
  testRemoveSession();
  testCleanupExpired();
  testStop();
  console.log('=== All unit tests passed ===\n');
} catch (e) {
  console.error('Unit test failed:', e);
  process.exit(1);
}