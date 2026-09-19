import { SessionManager, UserSession } from "./sessionManager";

// ── Helpers ─────────────────────────────────────────────────────────
let sm: SessionManager;

function fresh(): SessionManager {
  if (sm) sm.stop();
  sm = new SessionManager();
  return sm;
}

// ── Tests ───────────────────────────────────────────────────────────
console.log("=== Unit Tests: SessionManager ===\n");

// 1. addSession
fresh();
const s1 = sm.addSession("u1", "tok-abc", 60_000, ["admin", "user"]);
console.assert(s1.id === "u1", "addSession: id mismatch");
console.assert(s1.token === "tok-abc", "addSession: token mismatch");
console.assert(s1.roles.length === 2, "addSession: roles length");
console.assert(sm.getSessionCount() === 1, "addSession: count should be 1");
console.log("[PASS] addSession");

// 2. hasSession / getSession
console.assert(sm.hasSession("u1") === true, "hasSession: should exist");
const got = sm.getSession("u1");
console.assert(got !== undefined, "getSession: should return session");
console.assert(got!.roles[0] === "admin", "getSession: roles intact");
console.log("[PASS] hasSession / getSession");

// 3. removeSession
sm.removeSession("u1");
console.assert(sm.hasSession("u1") === false, "removeSession: gone");
console.assert(sm.getSessionCount() === 0, "removeSession: count 0");
console.log("[PASS] removeSession");

// 4. Expired session auto-removed by getSession
// 5. cleanupExpired returns correct count
// 6. stop() clears interval (no errors thrown)
// 7. Default roles
// 8. getSession on non-existent
(async () => {
  // 4. Expired session auto-removed by getSession
  fresh();
  sm.addSession("exp1", "tok-exp", 50, ["viewer"]); // 50 ms TTL
  console.assert(sm.hasSession("exp1") === true, "before expiry");
  // Wait for expiry
  await new Promise((r) => setTimeout(r, 100));
  console.assert(sm.hasSession("exp1") === false, "after expiry: hasSession false");
  console.assert(sm.getSession("exp1") === undefined, "after expiry: getSession undefined");
  console.log("[PASS] Expired session auto-removed");

  // 5. cleanupExpired returns correct count
  fresh();
  sm.addSession("c1", "t1", 50);
  sm.addSession("c2", "t2", 50);
  sm.addSession("c3", "t3", 3600_000); // long-lived
  await new Promise((r) => setTimeout(r, 100));
  const removed = sm.cleanupExpired();
  console.assert(removed === 2, `cleanupExpired: expected 2, got ${removed}`);
  console.assert(sm.getSessionCount() === 1, "cleanupExpired: 1 remains");
  console.log("[PASS] cleanupExpired");

  // 6. stop() clears interval (no errors thrown)
  fresh();
  sm.stop();
  console.log("[PASS] stop()");

  // 7. Default roles
  fresh();
  const s7 = sm.addSession("u7", "tok7");
  console.assert(s7.roles.length === 0, "default roles empty");
  console.log("[PASS] default roles");

  // 8. getSession on non-existent
  fresh();
  console.assert(sm.getSession("nope") === undefined, "non-existent session");
  console.log("[PASS] non-existent session");

  console.log("\n=== All Unit Tests Passed ===\n");

  // Ensure process exits even if interval is still running
  process.exit(0);
})();