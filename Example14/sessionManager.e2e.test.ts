/**
 * E2E tests for the SessionManager running inside the Docker container.
 *
 * The container is started/stopped by `npm run e2e` (deploy.sh).
 * These tests only talk to the running container over HTTP.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";

interface SessionDto {
  id: string;
  token: string;
  expiresAt: string;
  roles: string[];
}

async function api(
  method: string,
  path: string,
  body?: unknown
): Promise<{ status: number; json: any }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers:
      body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

describe("SessionManager E2E (Docker container)", () => {
  describe("GET /health", () => {
    it("returns 200 and status ok", async () => {
      const { status, json } = await api("GET", "/health");
      assert.equal(status, 200);
      assert.equal(json.status, "ok");
    });
  });

  describe("POST /sessions", () => {
    it("creates a session (201) with id, token, roles and expiresAt", async () => {
      const { status, json } = await api("POST", "/sessions", {
        token: "e2e-token-1",
        ttlMs: 60_000,
        roles: ["admin"],
      });
      assert.equal(status, 201);
      assert.ok(json.id, "session must have an id");
      assert.equal(json.token, "e2e-token-1");
      assert.deepEqual(json.roles, ["admin"]);
      assert.ok(
        !Number.isNaN(Date.parse(json.expiresAt)),
        "expiresAt must be a valid date"
      );
      assert.ok(
        Date.parse(json.expiresAt) > Date.now(),
        "expiresAt must be in the future"
      );
    });

    it("accepts an explicit id", async () => {
      const { status, json } = await api("POST", "/sessions", {
        token: "e2e-token-2",
        id: "my-custom-id",
      });
      assert.equal(status, 201);
      assert.equal(json.id, "my-custom-id");
    });

    it("rejects missing token (400)", async () => {
      const { status } = await api("POST", "/sessions", { roles: ["user"] });
      assert.equal(status, 400);
    });

    it("rejects invalid JSON (400)", async () => {
      const res = await fetch(`${BASE}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      });
      assert.equal(res.status, 400);
    });
  });

  describe("GET /sessions/:id", () => {
    it("returns 200 for an existing session", async () => {
      const { json } = await api("POST", "/sessions", {
        token: "e2e-get-session",
        ttlMs: 60_000,
      });
      const { status } = await api("GET", `/sessions/${json.id}`);
      assert.equal(status, 200);
    });

    it("returns 404 for an unknown id", async () => {
      const { status } = await api("GET", "/sessions/nonexistent-id");
      assert.equal(status, 404);
    });

    it("returns 404 for an expired session", async () => {
      const { json } = await api("POST", "/sessions", {
        token: "e2e-expiring",
        ttlMs: 500,
      });
      await new Promise((r) => setTimeout(r, 700));
      const { status } = await api("GET", `/sessions/${json.id}`);
      assert.equal(status, 404);
    });
  });

  describe("GET /sessions", () => {
    it("returns a list of sessions", async () => {
      const { status, json } = await api("GET", "/sessions");
      assert.equal(status, 200);
      assert.ok(Array.isArray(json), "response must be an array");
    });
  });

  describe("DELETE /sessions/:id", () => {
    it("returns 200 and removes the session", async () => {
      const { json } = await api("POST", "/sessions", {
        token: "e2e-delete",
        ttlMs: 60_000,
      });
      const { status, json: deleteJson } = await api("DELETE", `/sessions/${json.id}`);
      assert.equal(status, 200);
      assert.equal(deleteJson.deleted, true);
    });

    it("returns 404 when deleting again", async () => {
      const { json } = await api("POST", "/sessions", {
        token: "e2e-delete-twice",
        ttlMs: 60_000,
      });
      await api("DELETE", `/sessions/${json.id}`);
      const { status } = await api("DELETE", `/sessions/${json.id}`);
      assert.equal(status, 404);
    });
  });

  describe("unknown route", () => {
    it("returns 404", async () => {
      const { status } = await api("GET", "/unknown");
      assert.equal(status, 404);
    });
  });
});
