import request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';

const PORT = parseInt(process.env.EXAMPLE_SESSIONMANAGER_PORT || '3000', 10);
const BASE_URL = `http://localhost:${PORT}`;

describe('SessionManager E2E - HTTP API', () => {
  // ─── Health Check ─────────────────────────────────────────────────────

  test('GET /api/health should return 200 with status ok', async () => {
    const res = await request(BASE_URL).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.activeSessions).toBeGreaterThanOrEqual(0);
    expect(res.body.data.timestamp).toBeDefined();
  });

  // ─── Create Session ───────────────────────────────────────────────────

  test('POST /api/sessions should create a session', async () => {
    const res = await request(BASE_URL)
      .post('/api/sessions')
      .send({ userId: 'e2e-user-1', roles: ['admin', 'user'], expiresInHours: 1 });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.expiresAt).toBeDefined();
    expect(res.body.data.roles).toEqual(['admin', 'user']);
  });

  test('POST /api/sessions should return 400 without userId', async () => {
    const res = await request(BASE_URL).post('/api/sessions').send({ roles: ['admin'] });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('userId is required');
  });

  test('POST /api/sessions should create session with default roles', async () => {
    const res = await request(BASE_URL)
      .post('/api/sessions')
      .send({ userId: 'e2e-user-2' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.roles).toEqual([]);
  });

  // ─── Get Session by ID ────────────────────────────────────────────────

  test('GET /api/sessions/:id should return session', async () => {
    const createRes = await request(BASE_URL)
      .post('/api/sessions')
      .send({ userId: 'e2e-get-user', roles: ['viewer'], expiresInHours: 1 });
    const sessionId = createRes.body.data.id;

    const res = await request(BASE_URL).get(`/api/sessions/${sessionId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(sessionId);
  });

  test('GET /api/sessions/:id should return 404 for non-existent session', async () => {
    const res = await request(BASE_URL).get('/api/sessions/non-existent-id');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // ─── Get Session by Token ─────────────────────────────────────────────

  test('GET /api/sessions/token/:token should return session', async () => {
    const createRes = await request(BASE_URL)
      .post('/api/sessions')
      .send({ userId: 'e2e-token-user', roles: ['editor'], expiresInHours: 1 });
    const token = createRes.body.data.token;

    const res = await request(BASE_URL).get(`/api/sessions/token/${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBe(token);
  });

  test('GET /api/sessions/token/:token should return 404 for invalid token', async () => {
    const res = await request(BASE_URL).get('/api/sessions/token/invalid-token-12345');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // ─── List Sessions ────────────────────────────────────────────────────

  test('GET /api/sessions should list all active sessions', async () => {
    await request(BASE_URL).post('/api/sessions').send({ userId: 'e2e-list-1', roles: ['a'], expiresInHours: 1 });
    await request(BASE_URL).post('/api/sessions').send({ userId: 'e2e-list-2', roles: ['b'], expiresInHours: 1 });

    const res = await request(BASE_URL).get('/api/sessions');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  // ─── Delete Session ───────────────────────────────────────────────────

  test('DELETE /api/sessions/:id should delete a session', async () => {
    const createRes = await request(BASE_URL)
      .post('/api/sessions')
      .send({ userId: 'e2e-delete', roles: [], expiresInHours: 1 });
    const sessionId = createRes.body.data.id;

    const delRes = await request(BASE_URL).delete(`/api/sessions/${sessionId}`);
    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.success).toBe(true);
    expect(delRes.body.data.deleted).toBe(sessionId);

    // Verify it's gone
    const getRes = await request(BASE_URL).get(`/api/sessions/${sessionId}`);
    expect(getRes.statusCode).toBe(404);
  });

  test('DELETE /api/sessions/:id should return 404 for non-existent session', async () => {
    const res = await request(BASE_URL).delete('/api/sessions/non-existent');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // ─── Cleanup ──────────────────────────────────────────────────────────

  test('POST /api/sessions/cleanup should remove expired sessions', async () => {
    const res = await request(BASE_URL).post('/api/sessions/cleanup');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.removed).toBeGreaterThanOrEqual(0);
  });

  // ─── Multiple Sessions ────────────────────────────────────────────────

  test('should handle multiple concurrent session operations', async () => {
    const sessions: { id: string; token: string }[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await request(BASE_URL)
        .post('/api/sessions')
        .send({ userId: `e2e-batch-${i}`, roles: ['batch'], expiresInHours: 1 });
      sessions.push({ id: res.body.data.id, token: res.body.data.token });
    }

    // Verify all are retrievable
    for (const s of sessions) {
      const getRes = await request(BASE_URL).get(`/api/sessions/${s.id}`);
      expect(getRes.statusCode).toBe(200);
      expect(getRes.body.data.id).toBe(s.id);
    }

    // Cleanup
    for (const s of sessions) {
      await request(BASE_URL).delete(`/api/sessions/${s.id}`);
    }
  });
});
