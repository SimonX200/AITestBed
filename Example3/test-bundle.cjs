// sessionManager.ts
var SessionManager = class {
  sessions = /* @__PURE__ */ new Map();
  cleanupInterval = null;
  constructor() {
    this.startAutoCleanup();
  }
  startAutoCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 6e4);
  }
  addSession(id, token, ttlMs = 36e5, roles = []) {
    const session = {
      id,
      token,
      expiresAt: new Date(Date.now() + ttlMs),
      roles
    };
    this.sessions.set(id, session);
    return session;
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
  cleanupExpired() {
    const now = /* @__PURE__ */ new Date();
    let removed = 0;
    for (const [id, session] of this.sessions) {
      if (session.expiresAt <= now) {
        this.sessions.delete(id);
        removed++;
      }
    }
    return removed;
  }
  getSessionCount() {
    return this.sessions.size;
  }
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
};

// sessionManager.test.ts
var sm;
function fresh() {
  if (sm) sm.stop();
  sm = new SessionManager();
  return sm;
}
console.log("=== Unit Tests: SessionManager ===\n");
fresh();
var s1 = sm.addSession("u1", "tok-abc", 6e4, ["admin", "user"]);
console.assert(s1.id === "u1", "addSession: id mismatch");
console.assert(s1.token === "tok-abc", "addSession: token mismatch");
console.assert(s1.roles.length === 2, "addSession: roles length");
console.assert(sm.getSessionCount() === 1, "addSession: count should be 1");
console.log("[PASS] addSession");
console.assert(sm.hasSession("u1") === true, "hasSession: should exist");
var got = sm.getSession("u1");
console.assert(got !== void 0, "getSession: should return session");
console.assert(got.roles[0] === "admin", "getSession: roles intact");
console.log("[PASS] hasSession / getSession");
sm.removeSession("u1");
console.assert(sm.hasSession("u1") === false, "removeSession: gone");
console.assert(sm.getSessionCount() === 0, "removeSession: count 0");
console.log("[PASS] removeSession");
(async () => {
  fresh();
  sm.addSession("exp1", "tok-exp", 50, ["viewer"]);
  console.assert(sm.hasSession("exp1") === true, "before expiry");
  await new Promise((r) => setTimeout(r, 100));
  console.assert(sm.hasSession("exp1") === false, "after expiry: hasSession false");
  console.assert(sm.getSession("exp1") === void 0, "after expiry: getSession undefined");
  console.log("[PASS] Expired session auto-removed");
  fresh();
  sm.addSession("c1", "t1", 50);
  sm.addSession("c2", "t2", 50);
  sm.addSession("c3", "t3", 36e5);
  await new Promise((r) => setTimeout(r, 100));
  const removed = sm.cleanupExpired();
  console.assert(removed === 2, `cleanupExpired: expected 2, got ${removed}`);
  console.assert(sm.getSessionCount() === 1, "cleanupExpired: 1 remains");
  console.log("[PASS] cleanupExpired");
  fresh();
  sm.stop();
  console.log("[PASS] stop()");
  fresh();
  const s7 = sm.addSession("u7", "tok7");
  console.assert(s7.roles.length === 0, "default roles empty");
  console.log("[PASS] default roles");
  fresh();
  console.assert(sm.getSession("nope") === void 0, "non-existent session");
  console.log("[PASS] non-existent session");
  console.log("\n=== All Unit Tests Passed ===\n");
  process.exit(0);
})();
