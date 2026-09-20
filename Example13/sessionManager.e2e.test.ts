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

async function api(method: string, path: string, body?: unknown): Promise<{ status: number; json: any }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
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
      assert.ok(!Number.isNaN(Date.parse(json.expiresAt)), "expiresAt must be a valid date");
      assert.ok(Date.parse(json.expiresAt) > Date.now(), "expiresAt must be in the future");
    });

    it("accepts an explicit id", async () => {
      const { status, json } = await api("POST", "/sessions", {
        token: "e2e-token-2",
        ttlMs: 60_000,
        id: "e2e-fixed-id",
      });
      assert.equal(status, 201);
      assert.equal(json.id, "e2e-fixed-id");
    });

    it("returns 400 when token is missing", async () => {
      const { status, json } = await api("POST", "/sessions", { ttlMs: 60_000 });
      assert.equal(status, 400);
      assert.ok(json.error);
    });

    it("returns 400 for invalid JSON", async () => {
      const res = await fetch(`${BASE}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not-json",
      });
      assert.equal(res.status, 400);
    });
  });

  describe("GET /sessions/:id (check)", () => {
    it("returns 200 with the session while it is valid", async () => {
      const created = await api("POST", "/sessions", { token: "e2e-token-3", ttlMs: 60_000 });
      const { status, json } = await api("GET", `/sessions/${created.json.id}`);
      assert.equal(status, 200);
      assert.equal(json.id, created.json.id);
      assert.equal(json.token, "e2e-token-3");
    });

    it("returns 404 for an unknown session", async () => {
      const { status, json } = await api("GET", "/sessions/unknown-id");
      assert.equal(status, 404);
      assert.ok(json.error);
    });

    it("returns 404 for an expired session", async () => {
      const created = await api("POST", "/sessions", { token: "e2e-token-4", ttlMs: -1000 });
      assert.equal(created.status, 201);
      const { status } = await api("GET", `/sessions/${created.json.id}`);
      assert.equal(status, 404);
    });
  });

  describe("GET /sessions (list)", () => {
    it("returns an array containing the created session", async () => {
      const created = await api("POST", "/sessions", { token: "e2e-token-5", ttlMs: 60_000 });
      const { status, json } = await api("GET", "/sessions");
      assert.equal(status, 200);
      assert.ok(Array.isArray(json));
      assert.ok(
        json.some((s: SessionDto) => s.id === created.json.id),
        "created session must be in the list"
      );
    });
  });

  describe("DELETE /sessions/:id", () => {
    it("deletes an existing session (200) and it is gone afterwards", async () => {
      const created = await api("POST", "/sessions", { token: "e2e-token-6", ttlMs: 60_000 });
      const del = await api("DELETE", `/sessions/${created.json.id}`);
      assert.equal(del.status, 200);
      assert.equal(del.json.deleted, true);
      const after = await api("GET", `/sessions/${created.json.id}`);
      assert.equal(after.status, 404);
    });

    it("returns 404 for an unknown session", async () => {
      const { status, json } = await api("DELETE", "/sessions/unknown-id");
      assert.equal(status, 404);
      assert.ok(json.error);
    });
  });

  describe("unknown routes", () => {
    it("returns 404 for an unknown path", async () => {
      const { status, json } = await api("GET", "/nope");
      assert.equal(status, 404);
      assert.ok(json.error);
    });
  });
});
