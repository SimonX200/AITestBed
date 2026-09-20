import { expect } from "chai";
import * as http from "http";

const BASE_URL = "http://localhost:3000";

function httpRequest(method: string, path: string, body?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: { "Content-Type": "application/json" },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe("E2E: Session Manager HTTP API", () => {
  describe("Health Check", () => {
    it("GET /health should return ok", async () => {
      const res = await httpRequest("GET", "/health");
      expect(res.status).to.equal(200);
      expect(res.data.status).to.equal("ok");
    });
  });

  describe("Create Session", () => {
    it("POST /session should create a session", async () => {
      const res = await httpRequest("POST", "/session", {
        id: "e2e-user-1",
        token: "e2e-token-abc",
        expiresInMs: 60000,
        roles: ["admin", "user"],
      });
      expect(res.status).to.equal(201);
      expect(res.data.id).to.equal("e2e-user-1");
      expect(res.data.token).to.equal("e2e-token-abc");
      expect(res.data.roles).to.deep.equal(["admin", "user"]);
      expect(res.data.expiresAt).to.not.be.undefined;
    });

    it("POST /session should return 400 for invalid JSON", async () => {
      // This test sends malformed JSON
      const res = await new Promise<any>((resolve) => {
        const url = new URL("/session", BASE_URL);
        const req = http.request({
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }, (response) => {
          let data = "";
          response.on("data", (chunk) => { data += chunk; });
          response.on("end", () => {
            resolve({ status: response.statusCode, data: data });
          });
        });
        req.on("error", () => resolve({ status: 500, data: "error" }));
        req.write("not valid json");
        req.end();
      });
      expect(res.status).to.equal(400);
    });
  });

  describe("Get Session", () => {
    it("GET /session?id=xxx should return the session", async () => {
      const res = await httpRequest("POST", "/session", {
        id: "e2e-get-1",
        token: "get-token",
        expiresInMs: 60000,
        roles: ["user"],
      });
      expect(res.status).to.equal(201);

      const getRes = await httpRequest("GET", "/session?id=e2e-get-1");
      expect(getRes.status).to.equal(200);
      expect(getRes.data.id).to.equal("e2e-get-1");
    });

    it("GET /session?id=xxx should return 404 for non-existent session", async () => {
      const res = await httpRequest("GET", "/session?id=nonexistent-e2e");
      expect(res.status).to.equal(404);
    });

    it("GET /session without id should return 400", async () => {
      const res = await httpRequest("GET", "/session");
      expect(res.status).to.equal(400);
    });
  });

  describe("List Sessions", () => {
    it("GET /sessions should return all active sessions", async () => {
      await httpRequest("POST", "/session", {
        id: "e2e-list-1",
        token: "list-token-1",
        expiresInMs: 60000,
        roles: ["user"],
      });
      await httpRequest("POST", "/session", {
        id: "e2e-list-2",
        token: "list-token-2",
        expiresInMs: 60000,
        roles: ["admin"],
      });

      const res = await httpRequest("GET", "/sessions");
      expect(res.status).to.equal(200);
      expect(Array.isArray(res.data)).to.be.true;
      expect(res.data.length).to.be.greaterThanOrEqual(2);
    });
  });

  describe("Delete Session", () => {
    it("DELETE /session?id=xxx should remove the session", async () => {
      await httpRequest("POST", "/session", {
        id: "e2e-delete-1",
        token: "delete-token",
        expiresInMs: 60000,
        roles: ["user"],
      });

      const delRes = await httpRequest("DELETE", "/session?id=e2e-delete-1");
      expect(delRes.status).to.equal(200);
      expect(delRes.data.deleted).to.be.true;

      const getRes = await httpRequest("GET", "/session?id=e2e-delete-1");
      expect(getRes.status).to.equal(404);
    });

    it("DELETE /session?id=xxx should return 404 for non-existent session", async () => {
      const res = await httpRequest("DELETE", "/session?id=nonexistent-delete");
      expect(res.status).to.equal(404);
    });
  });

  describe("Cleanup", () => {
    it("POST /cleanup should trigger manual cleanup", async () => {
      await httpRequest("POST", "/session", {
        id: "e2e-expire-1",
        token: "expire-token",
        expiresInMs: 100,
        roles: ["user"],
      });

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 200));

      const res = await httpRequest("POST", "/cleanup");
      expect(res.status).to.equal(200);
      expect(res.data.cleaned).to.be.true;

      const getRes = await httpRequest("GET", "/session?id=e2e-expire-1");
      expect(getRes.status).to.equal(404);
    });
  });

  describe("Session Expiration via API", () => {
    it("should return 404 for expired session", async () => {
      await httpRequest("POST", "/session", {
        id: "e2e-expiry-test",
        token: "expiry-token",
        expiresInMs: 100,
        roles: ["user"],
      });

      // Should be available immediately
      let res = await httpRequest("GET", "/session?id=e2e-expiry-test");
      expect(res.status).to.equal(200);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should be expired now
      res = await httpRequest("GET", "/session?id=e2e-expiry-test");
      expect(res.status).to.equal(404);
    });
  });
});
