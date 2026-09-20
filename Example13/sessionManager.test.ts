import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { SessionManager, type UserSession } from "./sessionManager";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("SessionManager", () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager(60_000);
  });

  afterEach(() => {
    manager.stopCleanup();
  });

  describe("addSession", () => {
    it("creates a session with id, token, roles and a future expiresAt", () => {
      const session = manager.addSession("tok-1", 60_000, ["admin", "user"]);
      assert.ok(session.id, "session must have an id");
      assert.equal(session.token, "tok-1");
      assert.deepEqual(session.roles, ["admin", "user"]);
      assert.ok(session.expiresAt instanceof Date);
      assert.ok(session.expiresAt.getTime() > Date.now(), "expiresAt must be in the future");
    });

    it("accepts an explicit id", () => {
      const session = manager.addSession("tok-2", 60_000, [], "my-id");
      assert.equal(session.id, "my-id");
    });

    it("defaults roles to an empty array", () => {
      const session = manager.addSession("tok-3", 60_000);
      assert.deepEqual(session.roles, []);
    });
  });

  describe("checkSession", () => {
    it("returns the session while it is valid", () => {
      const created = manager.addSession("tok-4", 60_000, ["user"]);
      const checked = manager.checkSession(created.id);
      assert.ok(checked);
      assert.equal(checked!.id, created.id);
      assert.equal(checked!.token, "tok-4");
    });

    it("returns null for an unknown id", () => {
      assert.equal(manager.checkSession("does-not-exist"), null);
    });

    it("returns null for an expired session and removes it", () => {
      const created = manager.addSession("tok-5", -1000, ["user"]);
      assert.equal(manager.checkSession(created.id), null);
      assert.equal(manager.checkSession(created.id), null);
      assert.equal(manager.listSessions().length, 0, "expired session must be removed");
    });
  });

  describe("deleteSession", () => {
    it("removes an existing session and returns true", () => {
      const created = manager.addSession("tok-6", 60_000);
      assert.equal(manager.deleteSession(created.id), true);
      assert.equal(manager.checkSession(created.id), null);
    });

    it("returns false for an unknown id", () => {
      assert.equal(manager.deleteSession("nope"), false);
    });
  });

  describe("listSessions", () => {
    it("lists all stored sessions", () => {
      const a = manager.addSession("tok-a", 60_000);
      const b = manager.addSession("tok-b", 60_000);
      const list = manager.listSessions();
      assert.equal(list.length, 2);
      const ids = list.map((s: UserSession) => s.id).sort();
      assert.deepEqual(ids, [a.id, b.id].sort());
    });
  });

  describe("cleanup", () => {
    it("removes only expired sessions and returns the count", () => {
      manager.addSession("expired-1", -1000);
      manager.addSession("expired-2", -1000);
      manager.addSession("valid", 60_000);
      const removed = manager.cleanup();
      assert.equal(removed, 2);
      assert.equal(manager.listSessions().length, 1);
    });

    it("returns 0 when nothing is expired", () => {
      manager.addSession("valid", 60_000);
      assert.equal(manager.cleanup(), 0);
    });
  });

  describe("automatic cleanup interval", () => {
    it("automatically removes expired sessions via setInterval", async () => {
      const fastManager = new SessionManager(50); // 50ms interval for the test
      fastManager.startCleanup();
      try {
        const session = fastManager.addSession("short-lived", 20);
        assert.ok(fastManager.checkSession(session.id), "session valid right after creation");
        await sleep(300);
        assert.equal(
          fastManager.checkSession(session.id),
          null,
          "session must have been removed by the automatic cleanup"
        );
      } finally {
        fastManager.stopCleanup();
      }
    });

    it("startCleanup is idempotent and stopCleanup stops it", async () => {
      const fastManager = new SessionManager(50);
      fastManager.startCleanup();
      fastManager.startCleanup(); // must not throw / double-schedule
      const session = fastManager.addSession("short-lived-2", 20);
      await sleep(300);
      assert.equal(fastManager.checkSession(session.id), null);
      fastManager.stopCleanup();
      fastManager.stopCleanup(); // must not throw
    });
  });
});
