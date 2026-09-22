/**
 * E2E tests for SessionManager HTTP API.
 * Tests all HTTP endpoints against a running Docker container.
 *
 * The container must be running on the port specified by
 * EXAMPLE_SessionManager_Port (default: 3500).
 */

const PORT = parseInt(process.env.EXAMPLE_SessionManager_Port || '3500', 10);
const BASE_URL = `http://localhost:${PORT}`;

// ─── Helper ───────────────────────────────────────────────────────────────────

async function fetchJson(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; data: unknown }> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

// ─── Health Check ─────────────────────────────────────────────────────────────

describe('E2E: Health Check', () => {
  it('GET /health should return 200 with status ok', async () => {
    const { status, data } = await fetchJson('/health');
    expect(status).toBe(200);
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('activeSessions');
  });
});

// ─── Create Session ───────────────────────────────────────────────────────────

describe('E2E: Create Session (POST /sessions)', () => {
  it('should create a session with default values', async () => {
    const { status, data } = await fetchJson('/sessions', {
      method: 'POST',
      body: JSON.stringify({ userId: 'e2e-user-1' }),
    });
    expect(status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('expiresAt');
    expect(data).toHaveProperty('roles');
    expect(Array.isArray(data.roles)).toBe(true);
  });

  it('should create a session with custom roles', async () => {
    const { status, data } = await fetchJson('/sessions', {
      method: 'POST',
      body: JSON.stringify({ userId: 'e2e-admin', roles: ['admin', 'superuser'] }),
    });
    expect(status).toBe(201);
    expect(data.roles).toEqual(['admin', 'superuser']);
  });

  it('should create a session with custom TTL', async () => {
    const { status, data } = await fetchJson('/sessions', {
      method: 'POST',
      body: JSON.stringify({ userId: 'e2e-temp', ttlMs: 5000 }),
    });
    expect(status).toBe(201);
    expect(data).toHaveProperty('expiresAt');
  });

  it('should return 400 for invalid JSON', async () => {
    const { status } = await fetchJson('/sessions', {
      method: 'POST',
      body: 'not-json',
      headers: { 'Content-Type': 'text/plain' },
    });
    expect(status).toBe(400);
  });
});

// ─── List Sessions ────────────────────────────────────────────────────────────

describe('E2E: List Sessions (GET /sessions)', () => {
  it('should return a list of active sessions', async () => {
    const { status, data } = await fetchJson('/sessions');
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('should include sessions created in previous tests', async () => {
    const { status, data } = await fetchJson('/sessions');
    expect(status).toBe(200);
    const sessions = data as Array<Record<string, unknown>>;
    expect(sessions.length).toBeGreaterThan(0);
  });
});

// ─── Get Session ──────────────────────────────────────────────────────────────

describe('E2E: Get Session (GET /sessions/:id)', () => {
  let createdSessionId: string;

  beforeAll(async () => {
    const { data } = await fetchJson('/sessions', {
      method: 'POST',
      body: JSON.stringify({ userId: 'e2e-get-test', roles: ['user'] }),
    });
    createdSessionId = (data as Record<string, string>).id;
  });

  it('should return the session details', async () => {
    const { status, data } = await fetchJson(`/sessions/${createdSessionId}`);
    expect(status).toBe(200);
    expect(data).toHaveProperty('id', createdSessionId);
    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('expiresAt');
    expect(data).toHaveProperty('roles');
  });

  it('should return 404 for non-existent session', async () => {
    const { status } = await fetchJson('/sessions/non-existent-id');
    expect(status).toBe(404);
  });
});

// ─── Delete Session ───────────────────────────────────────────────────────────

describe('E2E: Delete Session (DELETE /sessions/:id)', () => {
  let createdSessionId: string;

  beforeAll(async () => {
    const { data } = await fetchJson('/sessions', {
      method: 'POST',
      body: JSON.stringify({ userId: 'e2e-delete-test' }),
    });
    createdSessionId = (data as Record<string, string>).id;
  });

  it('should delete the session and return 200', async () => {
    const { status, data } = await fetchJson(`/sessions/${createdSessionId}`, {
      method: 'DELETE',
    });
    expect(status).toBe(200);
    expect(data).toHaveProperty('message', 'Session deleted');
    expect(data).toHaveProperty('id', createdSessionId);
  });

  it('should return 404 when trying to delete again', async () => {
    const { status } = await fetchJson(`/sessions/${createdSessionId}`, {
      method: 'DELETE',
    });
    expect(status).toBe(404);
  });

  it('should return 404 for non-existent session', async () => {
    const { status } = await fetchJson('/sessions/non-existent-id', {
      method: 'DELETE',
    });
    expect(status).toBe(404);
  });
});

// ─── Route Not Found ──────────────────────────────────────────────────────────

describe('E2E: Route Not Found', () => {
  it('should return 404 for unknown routes', async () => {
    const { status } = await fetchJson('/unknown');
    expect(status).toBe(404);
  });

  it('should return 404 for unsupported methods', async () => {
    const { status } = await fetchJson('/sessions', {
      method: 'PATCH',
    });
    expect(status).toBe(404);
  });
});
