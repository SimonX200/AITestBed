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
  addSession(id, token, expiresAt, roles) {
    const session = { id, token, expiresAt, roles };
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
  getAllSessions() {
    return Array.from(this.sessions.values()).filter((s) => s.expiresAt > /* @__PURE__ */ new Date());
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
function assert(condition, msg) {
  if (!condition) throw new Error(`ASSERTION FAILED: ${msg}`);
}
{
  sm = new SessionManager();
  const future = new Date(Date.now() + 36e5);
  sm.addSession("s1", "tok1", future, ["admin", "user"]);
  assert(sm.hasSession("s1"), "s1 should exist");
  assert(!sm.hasSession("nonexistent"), "nonexistent should not exist");
  console.log("\u2713 Test 1: addSession & hasSession");
}
{
  sm = new SessionManager();
  const future = new Date(Date.now() + 36e5);
  const session = sm.addSession("s2", "tok2", future, ["editor"]);
  assert(session.id === "s2", "returned session id should match");
  assert(session.roles.length === 1, "should have 1 role");
  const retrieved = sm.getSession("s2");
  assert(retrieved !== void 0, "getSession should return session");
  assert(retrieved.token === "tok2", "token should match");
  console.log("\u2713 Test 2: getSession returns session data");
}
{
  sm = new SessionManager();
  const past = new Date(Date.now() - 1e3);
  sm.addSession("s3", "tok3", past, ["user"]);
  const removed = sm.cleanupExpired();
  assert(removed === 1, "should have removed 1 expired session");
  assert(!sm.hasSession("s3"), "expired session should be gone");
  console.log("\u2713 Test 3: cleanupExpired removes expired sessions");
}
{
  sm = new SessionManager();
  const future = new Date(Date.now() + 36e5);
  sm.addSession("s4", "tok4", future, ["user"]);
  assert(sm.removeSession("s4"), "removeSession should return true");
  assert(!sm.hasSession("s4"), "session should be removed");
  assert(!sm.removeSession("s4"), "removeSession should return false for missing");
  console.log("\u2713 Test 4: removeSession");
}
{
  sm = new SessionManager();
  const future = new Date(Date.now() + 36e5);
  const past = new Date(Date.now() - 1e3);
  sm.addSession("s5a", "tok5a", future, ["admin"]);
  sm.addSession("s5b", "tok5b", past, ["user"]);
  const all = sm.getAllSessions();
  assert(all.length === 1, "should return only 1 valid session");
  assert(all[0].id === "s5a", "should be s5a");
  console.log("\u2713 Test 5: getAllSessions filters expired");
}
{
  sm = new SessionManager();
  sm.stop();
  sm.stop();
  console.log("\u2713 Test 6: stop cleanup interval");
}
{
  sm = new SessionManager();
  const past = new Date(Date.now() - 1e3);
  sm.addSession("auto1", "tok", past, ["user"]);
  sm.addSession("auto2", "tok2", new Date(Date.now() + 36e5), ["admin"]);
  const removed = sm.cleanupExpired();
  assert(removed === 1, "auto cleanup should remove 1");
  assert(sm.getAllSessions().length === 1, "only 1 session should remain");
  sm.stop();
  console.log("\u2713 Test 7: auto-cleanup behavior");
}
console.log("\n=== All unit tests passed ===\n");
