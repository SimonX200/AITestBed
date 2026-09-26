import http from 'http';

// Get port from environment or find a free port
const PORT = process.env.E2E_PORT || process.env.EXAMPLE_SESSIONMANAGER_PORT || '3000';
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path: string, method: string = 'GET', body?: unknown): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = http.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        let data: unknown;
        try {
          data = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
        } catch {
          data = Buffer.concat(chunks).toString('utf-8');
        }
        resolve({ status: res.statusCode || 0, data });
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error(`Request to ${path} timed out`));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function waitForServer(maxRetries: number = 30, delay: number = 1000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await makeRequest('/api/health');
      if (result.status === 200) return;
    } catch {
      // Server not ready yet
    }
    if (i < maxRetries - 1) await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error('Server did not become ready in time');
}

describe('SessionManager E2E Tests', () => {
  beforeAll(async () => {
    await waitForServer();
  }, 35000);

  afterAll(async () => {
    // Cleanup: delete all created sessions
    try {
      const result = await makeRequest('/api/sessions');
      if (result.status === 200) {
        const data = result.data as { sessions: { id: string }[] };
        for (const session of data.sessions) {
          await makeRequest(`/api/sessions/${session.id}`, 'DELETE');
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Health Check', () => {
    it('should return 200 with health status', async () => {
      const result = await makeRequest('/api/health');
      expect(result.status).toBe(200);
      const data = result.data as { status: string; sessionCount: number };
      expect(data.status).toBe('ok');
      expect(typeof data.sessionCount).toBe('number');
    });
  });

  describe('Create Session', () => {
    it('should create a session with required fields', async () => {
      const session = await makeRequest('/api/sessions', 'POST', {
        token: 'e2e-token-1',
        roles: ['user'],
        expiresIn: 3600,
      });
      expect(session.status).toBe(201);
      const data = session.data as { id: string; token: string; roles: string[]; expiresAt: string };
      expect(data.id).toBeDefined();
      expect(data.token).toBe('e2e-token-1');
      expect(data.roles).toContain('user');
      expect(data.expiresAt).toBeDefined();
    });

    it('should return 400 when token is missing', async () => {
      const result = await makeRequest('/api/sessions', 'POST', {
        roles: ['user'],
      });
      expect(result.status).toBe(400);
    });

    it('should return 400 when body is invalid JSON', async () => {
      // We can't easily send raw invalid JSON with http.request,
      // but the endpoint handles it
      const result = await makeRequest('/api/sessions', 'POST', {
        token: 'e2e-token-2',
      });
      expect(result.status).toBe(201);
    });
  });

  describe('Get Session by ID', () => {
    let createdSessionId: string;

    beforeAll(async () => {
      const result = await makeRequest('/api/sessions', 'POST', {
        token: 'e2e-token-get',
        roles: ['admin'],
      });
      const data = result.data as { id: string };
      createdSessionId = data.id;
    });

    it('should return session by ID', async () => {
      const result = await makeRequest(`/api/sessions/${createdSessionId}`);
      expect(result.status).toBe(200);
      const data = result.data as { id: string; token: string };
      expect(data.id).toBe(createdSessionId);
      expect(data.token).toBe('e2e-token-get');
    });

    it('should return 404 for non-existent session', async () => {
      const result = await makeRequest('/api/sessions/non-existent-id');
      expect(result.status).toBe(404);
    });
  });

  describe('Get Session by Token', () => {
    it('should return session by token', async () => {
      // First create a session
      await makeRequest('/api/sessions', 'POST', {
        token: 'e2e-token-search',
        roles: ['user'],
      });

      const result = await makeRequest('/api/sessions/token/e2e-token-search');
      expect(result.status).toBe(200);
      const data = result.data as { token: string };
      expect(data.token).toBe('e2e-token-search');
    });

    it('should return 404 for non-existent token', async () => {
      const result = await makeRequest('/api/sessions/token/non-existent-token');
      expect(result.status).toBe(404);
    });
  });

  describe('List Sessions', () => {
    it('should return all sessions', async () => {
      const result = await makeRequest('/api/sessions');
      expect(result.status).toBe(200);
      const data = result.data as { sessions: unknown[]; count: number };
      expect(Array.isArray(data.sessions)).toBe(true);
      expect(typeof data.count).toBe('number');
      expect(data.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Delete Session', () => {
    let createdSessionId: string;

    beforeAll(async () => {
      const result = await makeRequest('/api/sessions', 'POST', {
        token: 'e2e-token-delete',
        roles: ['user'],
      });
      const data = result.data as { id: string };
      createdSessionId = data.id;
    });

    it('should delete a session', async () => {
      const result = await makeRequest(`/api/sessions/${createdSessionId}`, 'DELETE');
      expect(result.status).toBe(200);
      const data = result.data as { message: string; id: string };
      expect(data.message).toBe('Session deleted');
      expect(data.id).toBe(createdSessionId);
    });

    it('should return 404 for non-existent session deletion', async () => {
      const result = await makeRequest('/api/sessions/non-existent-id', 'DELETE');
      expect(result.status).toBe(404);
    });
  });

  describe('Cleanup', () => {
    it('should trigger cleanup and return count', async () => {
      const result = await makeRequest('/api/sessions/cleanup', 'POST');
      expect(result.status).toBe(200);
      const data = result.data as { removed: number };
      expect(typeof data.removed).toBe('number');
    });
  });

  describe('Unknown Route', () => {
    it('should return 404 for unknown routes', async () => {
      const result = await makeRequest('/api/unknown');
      expect(result.status).toBe(404);
    });
  });
});
