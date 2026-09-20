/**
 * Unit Tests for SessionManager
 * Uses Node.js built-in 'assert' module — no external dependencies needed.
 * Tests against the compiled dist/bundle.js (CommonJS).
 */

import assert from 'node:assert';
import { describe, it } from 'node:test';
import { SessionManager } from './dist/bundle.js';

describe('SessionManager — Unit Tests', () => {
  it('should add a session and return it via getSession', () => {
    const sm = new SessionManager();
    const future = new Date(Date.now() + 3600_000); // 1 hour from now
    sm.addSession('sess-1', 'tok-abc', future, ['admin', 'user']);
    const session = sm.getSession('sess-1');
    assert.strictEqual(session?.id, 'sess-1');
    assert.strictEqual(session?.token, 'tok-abc');
    assert.deepStrictEqual(session?.roles, ['admin', 'user']);
    assert.strictEqual(sm.count(), 1);
  });

  it('should return undefined for a non-existent session', () => {
    const sm = new SessionManager();
    assert.strictEqual(sm.getSession('nonexistent'), undefined);
  });

  it('should return false for an invalid session ID', () => {
    const sm = new SessionManager();
    assert.strictEqual(sm.isValidSession('nope'), false);
  });

  it('should detect an expired session and remove it', () => {
    const sm = new SessionManager();
    const past = new Date(Date.now() - 1000); // 1 second ago
    sm.addSession('expired-1', 'tok-old', past, ['user']);
    assert.strictEqual(sm.isValidSession('expired-1'), false);
    assert.strictEqual(sm.count(), 0);
  });

  it('should return true for a valid (non-expired) session', () => {
    const sm = new SessionManager();
    const future = new Date(Date.now() + 3600_000);
    sm.addSession('valid-1', 'tok-ok', future, ['user']);
    assert.strictEqual(sm.isValidSession('valid-1'), true);
  });

  it('should remove a session explicitly', () => {
    const sm = new SessionManager();
    const future = new Date(Date.now() + 3600_000);
    sm.addSession('remove-me', 'tok', future, []);
    assert.strictEqual(sm.removeSession('remove-me'), true);
    assert.strictEqual(sm.getSession('remove-me'), undefined);
    assert.strictEqual(sm.removeSession('remove-me'), false); // already gone
  });

  it('should list only active sessions', () => {
    const sm = new SessionManager();
    const future = new Date(Date.now() + 3600_000);
    const past = new Date(Date.now() - 1000);
    sm.addSession('active-1', 'tok1', future, ['admin']);
    sm.addSession('expired-1', 'tok2', past, ['user']);
    const active = sm.listSessions();
    assert.strictEqual(active.length, 1);
    assert.strictEqual(active[0].id, 'active-1');
  });

  it('should clear all sessions', () => {
    const sm = new SessionManager();
    const future = new Date(Date.now() + 3600_000);
    sm.addSession('a', 't1', future, []);
    sm.addSession('b', 't2', future, []);
    sm.clear();
    assert.strictEqual(sm.count(), 0);
    assert.strictEqual(sm.listSessions().length, 0);
  });

  it('should start and stop auto-cleanup', () => {
    const sm = new SessionManager();
    const past = new Date(Date.now() - 1000);
    sm.addSession('auto-exp', 'tok', past, []);
    sm.startAutoCleanup(100); // use 100ms interval for faster testing
    // Wait for the interval to fire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        sm.stopAutoCleanup();
        assert.strictEqual(sm.count(), 0); // expired session should be cleaned
        resolve();
      }, 500);
    });
  });

  it('should clean up expired sessions manually', () => {
    const sm = new SessionManager();
    const future = new Date(Date.now() + 3600_000);
    const past = new Date(Date.now() - 1000);
    sm.addSession('keep', 'tok1', future, []);
    sm.addSession('drop1', 'tok2', past, []);
    sm.addSession('drop2', 'tok3', past, []);
    sm.cleanupExpired();
    assert.strictEqual(sm.count(), 1);
    assert.strictEqual(sm.getSession('keep')?.id, 'keep');
  });
});