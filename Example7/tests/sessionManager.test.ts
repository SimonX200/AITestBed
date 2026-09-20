import { expect } from "chai";
import { SessionManager, UserSession } from "../sessionManager";

describe("SessionManager", () => {
  let sm: SessionManager;

  beforeEach(() => {
    sm = new SessionManager();
  });

  afterEach(() => {
    sm.stopAutoCleanup();
  });

  describe("addSession", () => {
    it("should create a session with given parameters", () => {
      const session = sm.addSession("user1", "token123", 60000, ["admin", "user"]);
      expect(session.id).to.equal("user1");
      expect(session.token).to.equal("token123");
      expect(session.roles).to.deep.equal(["admin", "user"]);
      expect(session.expiresAt).to.be.instanceOf(Date);
    });

    it("should return the created session object", () => {
      const session = sm.addSession("user2", "abc", 30000, []);
      expect(session).to.have.property("id", "user2");
      expect(session).to.have.property("token", "abc");
    });
  });

  describe("hasSession", () => {
    it("should return true for a valid session", () => {
      sm.addSession("user1", "token1", 60000, ["user"]);
      expect(sm.hasSession("user1")).to.be.true;
    });

    it("should return false for a non-existent session", () => {
      expect(sm.hasSession("nonexistent")).to.be.false;
    });

    it("should return false for an expired session", (done) => {
      sm.addSession("user1", "token1", 100, ["user"]);
      expect(sm.hasSession("user1")).to.be.true;
      setTimeout(() => {
        expect(sm.hasSession("user1")).to.be.false;
        done();
      }, 200);
    });
  });

  describe("getSession", () => {
    it("should return the session for a valid id", () => {
      sm.addSession("user1", "token1", 60000, ["admin"]);
      const session = sm.getSession("user1");
      expect(session).to.not.be.undefined;
      expect(session!.id).to.equal("user1");
    });

    it("should return undefined for a non-existent session", () => {
      const session = sm.getSession("nonexistent");
      expect(session).to.be.undefined;
    });

    it("should delete expired sessions and return undefined", (done) => {
      sm.addSession("user1", "token1", 100, ["user"]);
      expect(sm.getSession("user1")).to.not.be.undefined;
      setTimeout(() => {
        const session = sm.getSession("user1");
        expect(session).to.be.undefined;
        done();
      }, 200);
    });
  });

  describe("removeSession", () => {
    it("should remove an existing session", () => {
      sm.addSession("user1", "token1", 60000, ["user"]);
      const result = sm.removeSession("user1");
      expect(result).to.be.true;
      expect(sm.hasSession("user1")).to.be.false;
    });

    it("should return false for a non-existent session", () => {
      const result = sm.removeSession("nonexistent");
      expect(result).to.be.false;
    });
  });

  describe("getAllSessions", () => {
    it("should return all active sessions", () => {
      sm.addSession("user1", "token1", 60000, ["user"]);
      sm.addSession("user2", "token2", 60000, ["admin"]);
      const sessions = sm.getAllSessions();
      expect(sessions).to.have.length(2);
    });

    it("should not include expired sessions", (done) => {
      sm.addSession("user1", "token1", 60000, ["user"]);
      sm.addSession("user2", "token2", 100, ["admin"]);
      setTimeout(() => {
        const sessions = sm.getAllSessions();
        expect(sessions).to.have.length(1);
        expect(sessions[0].id).to.equal("user1");
        done();
      }, 200);
    });
  });

  describe("startAutoCleanup / stopAutoCleanup", () => {
    it("should clean up expired sessions automatically", (done) => {
      sm.startAutoCleanup(150);
      sm.addSession("user1", "token1", 100, ["user"]);
      expect(sm.hasSession("user1")).to.be.true;
      setTimeout(() => {
        expect(sm.hasSession("user1")).to.be.false;
        done();
      }, 400);
    });

    it("should stop cleanup when stopAutoCleanup is called", (done) => {
      sm.startAutoCleanup(100);
      sm.addSession("user1", "token1", 50, ["user"]);
      sm.stopAutoCleanup();
      setTimeout(() => {
        // Add a new session and verify cleanup interval is not running
        sm.startAutoCleanup(100);
        sm.addSession("user2", "token2", 50, ["user"]);
        sm.stopAutoCleanup();
        setTimeout(() => {
          done();
        }, 150);
      }, 200);
    });
  });

  describe("cleanupExpired (private method via bracket notation)", () => {
    it("should remove expired sessions when called manually", () => {
      sm.addSession("user1", "token1", 100, ["user"]);
      sm.addSession("user2", "token2", 60000, ["admin"]);
      setTimeout(() => {
        (sm as any).cleanupExpired();
        expect(sm.hasSession("user1")).to.be.false;
        expect(sm.hasSession("user2")).to.be.true;
      }, 150);
    });
  });
});
