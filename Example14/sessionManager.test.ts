import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SessionManager } from "./sessionManager";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("SessionManager Unit Tests", () => {
  describe("addSession", () => {
    it("creates a session with id, token, roles and expiresAt", () => {
      const mgr = new SessionManager(60_000);
      const session = mgr.addSession("test-token", 60_000, ["admin"]);
      assert.ok(session.id, "session must have an id");
      assert.equal(session.token, "test-token");
      assert.deepEqual(session.roles, ["admin"]);
      assert.ok(
        session.expiresAt.getTime() > Date.now(),
        "expiresAt must be in the future"
      );
    });

    it("uses default roles when not provided", () => {
      const mgr = new SessionManager(60_000);
      const session = mgr.addSession("test-token", 60_000);
      assert.deepEqual(session.roles, []);
    });

    it("uses default ttlMs of 300000 (30 min)", () => {
      const mgr = new SessionManager(60_000);
      const session = mgr.addSession("test-token", 300_000);
      const diff = session.expiresAt.getTime() - Date.now();
      assert.ok(diff >= 299_000 && diff <= 301_000, "ttlMs should be ~300000");
    });
  });

  describe("checkSession", () => {
    it("returns the session for a valid id", () => {
      const mgr = new SessionManager(60_000);
      const session = mgr.addSession("tok", 60_000);
      const found = mgr.checkSession(session.id);
      assert.ok(found);
      assert.equal(found!.token, "tok");
    });

    it("returns null for an unknown id", () => {
      const mgr = new SessionManager(60_000);
      assert.equal(mgr.checkSession("nonexistent"), null);
    });

    it("returns null and removes an expired session", async () => {
      const mgr = new SessionManager(60_000);
      const session = mgr.addSession("tok", 50);
      await sleep(100);
      const found = mgr.checkSession(session.id);
      assert.equal(found, null);
      assert.equal(mgr.listSessions().length, 0);
    });
  });

  describe("deleteSession", () => {
    it("returns true when session exists", () => {
      const mgr = new SessionManager(60_000);
      const session = mgr.addSession("tok", 60_000);
      assert.equal(mgr.deleteSession(session.id), true);
    });

    it("returns false when session does not exist", () => {
      const mgr = new SessionManager(60_000);
      assert.equal(mgr.deleteSession("nonexistent"), false);
    });
  });

  describe("listSessions", () => {
    it("returns all sessions", () => {
      const mgr = new SessionManager(60_000);
      mgr.addSession("tok1", 60_000);
      mgr.addSession("tok2", 60_000);
      const list = mgr.listSessions();
      assert.equal(list.length, 2);
    });
  });

  describe("cleanup", () => {
    it("removes only expired sessions", async () => {
      const mgr = new SessionManager(60_000);
      mgr.addSession("tok1", 60_000);
      mgr.addSession("tok2", 50);
      await sleep(100);
      const removed = mgr.cleanup();
      assert.equal(removed, 1);
      assert.equal(mgr.listSessions().length, 1);
    });
  });

  describe("automatic cleanup interval", () => {
    it("removes expired sessions after interval", async () => {
      const mgr = new SessionManager(50);
      mgr.startCleanup();
      mgr.addSession("tok", 10);
      await sleep(300);
      assert.equal(mgr.listSessions().length, 0);
    });
  });
});
