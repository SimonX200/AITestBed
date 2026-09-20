import { expect } from "chai";
import { SessionManager, UserSession } from "../sessionManager";

describe("SessionManager", () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager();
    manager.stopCleanup(); // prevent auto-cleanup during tests
  });

  afterEach(() => {
    manager.stopCleanup();
  });

  // --- addSession / hasSession / getSession ---

  it("should add a session and report it as valid", () => {
    const session: UserSession = {
      id: "s1",
      token: "tok1",
      expiresAt: new Date(Date.now() + 3600000),
      roles: ["admin"],
    };
    manager.addSession(session);
    expect(manager.hasSession("s1")).to.be.true;
  });

  it("should return false for a non-existent session", () => {
    expect(manager.hasSession("nonexistent")).to.be.false;
  });

  it("should return the session object via getSession", () => {
    const session: UserSession = {
      id: "s2",
      token: "tok2",
      expiresAt: new Date(Date.now() + 7200000),
      roles: ["user", "editor"],
    };
    manager.addSession(session);
    const found = manager.getSession("s2");
    expect(found).to.not.be.undefined;
    expect(found!.id).to.equal("s2");
    expect(found!.token).to.equal("tok2");
    expect(found!.roles).to.deep.equal(["user", "editor"]);
  });

  // --- expired sessions ---

  it("should treat an expired session as invalid", () => {
    const session: UserSession = {
      id: "expired1",
      token: "tok-exp",
      expiresAt: new Date(Date.now() - 1000), // 1 second ago
      roles: [],
    };
    manager.addSession(session);
    expect(manager.hasSession("expired1")).to.be.false;
  });

  it("should remove expired session on getSession call", () => {
    const session: UserSession = {
      id: "expired2",
      token: "tok-exp2",
      expiresAt: new Date(Date.now() - 5000),
      roles: [],
    };
    manager.addSession(session);
    const found = manager.getSession("expired2");
    expect(found).to.be.undefined;
    expect(manager.hasSession("expired2")).to.be.false;
  });

  // --- removeSession ---

  it("should remove an existing session", () => {
    const session: UserSession = {
      id: "s3",
      token: "tok3",
      expiresAt: new Date(Date.now() + 3600000),
      roles: [],
    };
    manager.addSession(session);
    expect(manager.removeSession("s3")).to.be.true;
    expect(manager.hasSession("s3")).to.be.false;
  });

  it("should return false when removing a non-existent session", () => {
    expect(manager.removeSession("no-such-id")).to.be.false;
  });

  // --- cleanupExpired ---

  it("should clean up expired sessions and return count", () => {
    manager.addSession({
      id: "keep",
      token: "k",
      expiresAt: new Date(Date.now() + 3600000),
      roles: [],
    });
    manager.addSession({
      id: "die1",
      token: "d1",
      expiresAt: new Date(Date.now() - 1000),
      roles: [],
    });
    manager.addSession({
      id: "die2",
      token: "d2",
      expiresAt: new Date(Date.now() - 2000),
      roles: [],
    });
    const removed = manager.cleanupExpired();
    expect(removed).to.equal(2);
    expect(manager.getSessionCount()).to.equal(1);
  });

  // --- getAllSessions ---

  it("should return only valid sessions", () => {
    manager.addSession({
      id: "a",
      token: "a",
      expiresAt: new Date(Date.now() + 3600000),
      roles: ["admin"],
    });
    manager.addSession({
      id: "b",
      token: "b",
      expiresAt: new Date(Date.now() - 1000),
      roles: ["user"],
    });
    const all = manager.getAllSessions();
    expect(all).to.have.lengthOf(1);
    expect(all[0].id).to.equal("a");
  });

  // --- getSessionCount ---

  it("should return correct count of valid sessions", () => {
    expect(manager.getSessionCount()).to.equal(0);
    manager.addSession({
      id: "x",
      token: "x",
      expiresAt: new Date(Date.now() + 3600000),
      roles: [],
    });
    manager.addSession({
      id: "y",
      token: "y",
      expiresAt: new Date(Date.now() + 7200000),
      roles: [],
    });
    expect(manager.getSessionCount()).to.equal(2);
  });

  // --- startCleanup / stopCleanup ---

  it("should auto-remove expired sessions via setInterval", (done) => {
    manager.addSession({
      id: "auto-expire",
      token: "ae",
      expiresAt: new Date(Date.now() - 100), // already expired
      roles: [],
    });
    manager.startCleanup(50); // 50ms interval
    setTimeout(() => {
      expect(manager.hasSession("auto-expire")).to.be.false;
      manager.stopCleanup();
      done();
    }, 200);
  });
});
