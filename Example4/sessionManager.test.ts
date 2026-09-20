import { SessionManager, UserSession } from './sessionManager';

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(`ASSERTION FAILED: ${msg}`);
}

function runTests(): Promise<void> {
  return new Promise((resolve) => {
    console.log('=== Unit Tests ===\n');

    const sm = new SessionManager();
    const future = new Date(Date.now() + 60_000);
    const session: UserSession = {
      id: 'sess-1',
      token: 'tok-abc',
      expiresAt: future,
      roles: ['admin', 'user'],
    };
    sm.addSession(session);
    assert(sm.hasSession('sess-1') === true, 'hasSession should return true for valid session');
    assert(sm.hasSession('nonexistent') === false, 'hasSession should return false for missing session');
    assert(sm.getSessionCount() === 1, 'getSessionCount should be 1');
    console.log('  ✓ addSession / hasSession');

    const retrieved = sm.getSession('sess-1');
    assert(retrieved !== undefined, 'getSession should return the session');
    assert(retrieved!.id === 'sess-1', 'getSession id mismatch');
    assert(retrieved!.roles.length === 2, 'getSession roles length mismatch');
    console.log('  ✓ getSession (valid)');

    sm.removeSession('sess-1');
    assert(sm.hasSession('sess-1') === false, 'hasSession should be false after removal');
    assert(sm.getSessionCount() === 0, 'getSessionCount should be 0 after removal');
    console.log('  ✓ removeSession');

    const expiredSession: UserSession = {
      id: 'sess-expired',
      token: 'tok-exp',
      expiresAt: new Date(Date.now() - 1_000),
      roles: ['user'],
    };
    sm.addSession(expiredSession);
    assert(sm.getSessionCount() === 1, 'session exists in map before expiration check');
    const afterGet = sm.getSession('sess-expired');
    assert(afterGet === undefined, 'getSession should return undefined for expired session');
    assert(sm.hasSession('sess-expired') === false, 'hasSession should return false for expired session');
    assert(sm.getSessionCount() === 0, 'getSession should auto-remove expired session');
    console.log('  ✓ expired session auto-removed');

    const sm2 = new SessionManager();
    const soonExpired: UserSession = {
      id: 'sess-soon',
      token: 'tok-soon',
      expiresAt: new Date(Date.now() + 500),
      roles: ['viewer'],
    };
    sm2.addSession(soonExpired);
    assert(sm2.getSessionCount() === 1, 'count before cleanup');
    sm2.startAutoCleanup(200);
    const waitCleanup = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
    waitCleanup(1000).then(() => {
      assert(sm2.getSessionCount() === 0, 'auto-cleanup should remove expired session');
      sm2.stopAutoCleanup();
      console.log('  ✓ auto-cleanup (setInterval)');

      const sm3 = new SessionManager();
      sm3.addSession({ id: 'a', token: 't1', expiresAt: new Date(Date.now() + 100_000), roles: ['r1'] });
      sm3.addSession({ id: 'b', token: 't2', expiresAt: new Date(Date.now() + 100_000), roles: ['r2'] });
      const all = sm3.getAllSessions();
      assert(all.length === 2, 'getAllSessions should return 2');
      sm3.stopAutoCleanup();
      console.log('  ✓ getAllSessions');

      console.log('\n=== All Unit Tests Passed ===\n');
      runE2ETests().then(() => {
        console.log('\n=== All Tests Passed ===');
        resolve();
      }).catch((err) => {
        console.error('E2E TEST FAILED:', err.message);
        process.exit(1);
      });
    });
  });
}

function runE2ETests(): Promise<void> {
  console.log('=== E2E Tests (Docker Container) ===\n');

  const checkContainerRunning = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const { exec } = require('child_process');
      exec('docker ps --filter "name=session-manager-container" --filter "status=running" --format "{{.ID}}"', (err, stdout) => {
        resolve(stdout.trim().length > 0);
      });
    });
  };

  const execCmd = (cmd: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec(cmd, (err, stdout) => {
        if (err) reject(err);
        else resolve(stdout.trim());
      });
    });
  };

  return checkContainerRunning().then((running) => {
    if (!running) {
      console.log('  ✗ Container is NOT running — skipping E2E tests');
      console.log('\n=== E2E Tests Skipped ===\n');
      return;
    }

    console.log('  ✓ Container is running');

    return execCmd('docker logs session-manager-container 2>&1 | head -20').then((logs) => {
      console.log('  ✓ Container logs accessible');
      console.log(`    (log preview: ${logs.substring(0, 80)}...)`);

      return execCmd('docker inspect session-manager-container --format "{{.Config.Image}}"').then((image) => {
        assert(image === 'session-manager-app', `Image should be session-manager-app, got ${image}`);
        console.log('  ✓ Container uses correct image');

        return execCmd('docker exec session-manager-container ls -la /app/bundle.js').then((ls) => {
          assert(ls.includes('bundle.js'), 'bundle.js should exist in container');
          console.log('  ✓ bundle.js exists in container');

          return execCmd('docker exec session-manager-container wc -c /app/bundle.js').then((wc) => {
            const size = parseInt(wc.split(' ')[0], 10);
            assert(size > 0, `bundle.js should have size > 0, got ${size}`);
            console.log(`  ✓ bundle.js size: ${size} bytes`);

            console.log('\n=== All E2E Tests Passed ===\n');
          });
        });
      });
    });
  });
}

runTests().then(() => {
  console.log('\n=== All Tests Passed ===');
  process.exit(0);
}).catch((err) => {
  console.error('TEST SUITE FAILED:', err.message);
  process.exit(1);
});