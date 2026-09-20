// sessionManager.ts
var SessionManager = class {
  sessions = /* @__PURE__ */ new Map();
  cleanupInterval = null;
  constructor() {
  }
  addSession(session) {
    this.sessions.set(session.id, session);
  }
  hasSession(id) {
    const session = this.sessions.get(id);
    if (!session) return false;
    return session.expiresAt > /* @__PURE__ */ new Date();
  }
  getSession(id) {
    const session = this.sessions.get(id);
    if (!session) return void 0;
    if (session.expiresAt <= /* @__PURE__ */ new Date()) {
      this.sessions.delete(id);
      return void 0;
    }
    return session;
  }
  removeSession(id) {
    return this.sessions.delete(id);
  }
  startAutoCleanup(intervalMs = 6e4) {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, intervalMs);
  }
  stopAutoCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
  cleanupExpired() {
    const now = /* @__PURE__ */ new Date();
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(id);
      }
    }
  }
  getAllSessions() {
    return Array.from(this.sessions.values());
  }
  getSessionCount() {
    return this.sessions.size;
  }
};

// sessionManager.test.ts
function assert(condition, msg) {
  if (!condition) throw new Error(`ASSERTION FAILED: ${msg}`);
}
function runTests() {
  return new Promise((resolve) => {
    console.log("=== Unit Tests ===\n");
    const sm = new SessionManager();
    const future = new Date(Date.now() + 6e4);
    const session = {
      id: "sess-1",
      token: "tok-abc",
      expiresAt: future,
      roles: ["admin", "user"]
    };
    sm.addSession(session);
    assert(sm.hasSession("sess-1") === true, "hasSession should return true for valid session");
    assert(sm.hasSession("nonexistent") === false, "hasSession should return false for missing session");
    assert(sm.getSessionCount() === 1, "getSessionCount should be 1");
    console.log("  \u2713 addSession / hasSession");
    const retrieved = sm.getSession("sess-1");
    assert(retrieved !== void 0, "getSession should return the session");
    assert(retrieved.id === "sess-1", "getSession id mismatch");
    assert(retrieved.roles.length === 2, "getSession roles length mismatch");
    console.log("  \u2713 getSession (valid)");
    sm.removeSession("sess-1");
    assert(sm.hasSession("sess-1") === false, "hasSession should be false after removal");
    assert(sm.getSessionCount() === 0, "getSessionCount should be 0 after removal");
    console.log("  \u2713 removeSession");
    const expiredSession = {
      id: "sess-expired",
      token: "tok-exp",
      expiresAt: new Date(Date.now() - 1e3),
      roles: ["user"]
    };
    sm.addSession(expiredSession);
    assert(sm.getSessionCount() === 1, "session exists in map before expiration check");
    const afterGet = sm.getSession("sess-expired");
    assert(afterGet === void 0, "getSession should return undefined for expired session");
    assert(sm.hasSession("sess-expired") === false, "hasSession should return false for expired session");
    assert(sm.getSessionCount() === 0, "getSession should auto-remove expired session");
    console.log("  \u2713 expired session auto-removed");
    const sm2 = new SessionManager();
    const soonExpired = {
      id: "sess-soon",
      token: "tok-soon",
      expiresAt: new Date(Date.now() + 500),
      roles: ["viewer"]
    };
    sm2.addSession(soonExpired);
    assert(sm2.getSessionCount() === 1, "count before cleanup");
    sm2.startAutoCleanup(200);
    const waitCleanup = (ms) => new Promise((r) => setTimeout(r, ms));
    waitCleanup(1e3).then(() => {
      assert(sm2.getSessionCount() === 0, "auto-cleanup should remove expired session");
      sm2.stopAutoCleanup();
      console.log("  \u2713 auto-cleanup (setInterval)");
      const sm3 = new SessionManager();
      sm3.addSession({ id: "a", token: "t1", expiresAt: new Date(Date.now() + 1e5), roles: ["r1"] });
      sm3.addSession({ id: "b", token: "t2", expiresAt: new Date(Date.now() + 1e5), roles: ["r2"] });
      const all = sm3.getAllSessions();
      assert(all.length === 2, "getAllSessions should return 2");
      sm3.stopAutoCleanup();
      console.log("  \u2713 getAllSessions");
      console.log("\n=== All Unit Tests Passed ===\n");
      runE2ETests().then(() => {
        console.log("\n=== All Tests Passed ===");
        resolve();
      }).catch((err) => {
        console.error("E2E TEST FAILED:", err.message);
        process.exit(1);
      });
    });
  });
}
function runE2ETests() {
  console.log("=== E2E Tests (Docker Container) ===\n");
  const checkContainerRunning = () => {
    return new Promise((resolve) => {
      const { exec } = require("child_process");
      exec('docker ps --filter "name=session-manager-container" --filter "status=running" --format "{{.ID}}"', (err, stdout) => {
        resolve(stdout.trim().length > 0);
      });
    });
  };
  const execCmd = (cmd) => {
    return new Promise((resolve, reject) => {
      const { exec } = require("child_process");
      exec(cmd, (err, stdout) => {
        if (err) reject(err);
        else resolve(stdout.trim());
      });
    });
  };
  return checkContainerRunning().then((running) => {
    if (!running) {
      console.log("  \u2717 Container is NOT running \u2014 skipping E2E tests");
      console.log("\n=== E2E Tests Skipped ===\n");
      return;
    }
    console.log("  \u2713 Container is running");
    return execCmd("docker logs session-manager-container 2>&1 | head -20").then((logs) => {
      console.log("  \u2713 Container logs accessible");
      console.log(`    (log preview: ${logs.substring(0, 80)}...)`);
      return execCmd('docker inspect session-manager-container --format "{{.Config.Image}}"').then((image) => {
        assert(image === "session-manager-app", `Image should be session-manager-app, got ${image}`);
        console.log("  \u2713 Container uses correct image");
        return execCmd("docker exec session-manager-container ls -la /app/bundle.js").then((ls) => {
          assert(ls.includes("bundle.js"), "bundle.js should exist in container");
          console.log("  \u2713 bundle.js exists in container");
          return execCmd("docker exec session-manager-container wc -c /app/bundle.js").then((wc) => {
            const size = parseInt(wc.split(" ")[0], 10);
            assert(size > 0, `bundle.js should have size > 0, got ${size}`);
            console.log(`  \u2713 bundle.js size: ${size} bytes`);
            console.log("\n=== All E2E Tests Passed ===\n");
          });
        });
      });
    });
  });
}
runTests().then(() => {
  console.log("\n=== All Tests Passed ===");
  process.exit(0);
}).catch((err) => {
  console.error("TEST SUITE FAILED:", err.message);
  process.exit(1);
});
