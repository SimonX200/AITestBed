import http from 'http';

const BASE_URL = `http://localhost:${process.env.EXAMPLE_SESSIONMANAGER_PORT || 3000}`;

// ─── Helper ──────────────────────────────────────────────────────────────────
function httpRequest(method: string, path: string, body?: object): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? require('https') : http;

    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method.toLowerCase(),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = lib.request(options, (res: http.IncomingMessage) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 0, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode || 0, data: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('Request timeout')); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('SessionManager E2E - HTTP API', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await httpRequest('GET', '/api/health');
      expect(res.status).toBe(200);
      expect(res.data.status).toBe('ok');
      expect(res.data.activeSessions).toBeGreaterThanOrEqual(0);
    });
  });

  describe('POST /api/sessions', () => {
    it('should create a session with default values', async () => {
      const res = await httpRequest('POST', '/api/sessions', {});
      expect(res.status).toBe(201);
      expect(res.data.id).toMatch(/^sess_/);
      expect(res.data.token).toMatch(/^tok_/);
      expect(res.data.roles).toEqual([]);
      expect(res.data.expiresAt).toBeDefined();
    });

    it('should create a session with custom roles', async () => {
      const res = await httpRequest('POST', '/api/sessions', { roles: ['admin', 'editor'] });
      expect(res.status).toBe(201);
      expect(res.data.roles).toEqual(['admin', 'editor']);
    });

    it('should create a session with custom expiration', async () => {
      const res = await httpRequest('POST', '/api/sessions', { expiresIn: 60000 });
      expect(res.status).toBe(201);
      expect(res.data.expiresAt).toBeDefined();
    });
  });

  describe('GET /api/sessions', () => {
    it('should return list of active sessions', async () => {
      // Create a session first
      await httpRequest('POST', '/api/sessions', { roles: ['user'] });
      const res = await httpRequest('GET', '/api/sessions');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/sessions/:id', () => {
    it('should return a session by ID', async () => {
      const createRes = await httpRequest('POST', '/api/sessions', { roles: ['admin'] });
      const sessionId = createRes.data.id;

      const res = await httpRequest('GET', `/api/sessions/${sessionId}`);
      expect(res.status).toBe(200);
      expect(res.data.id).toBe(sessionId);
    });

    it('should return 404 for non-existent session', async () => {
      const res = await httpRequest('GET', '/api/sessions/nonexistent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    it('should delete a session', async () => {
      const createRes = await httpRequest('POST', '/api/sessions', {});
      const sessionId = createRes.data.id;

      const delRes = await httpRequest('DELETE', `/api/sessions/${sessionId}`);
      expect(delRes.status).toBe(200);
      expect(delRes.data.message).toBe('Session deleted');

      // Verify deletion
      const getRes = await httpRequest('GET', `/api/sessions/${sessionId}`);
      expect(getRes.status).toBe(404);
    });

    it('should return 404 for non-existent session', async () => {
      const res = await httpRequest('DELETE', '/api/sessions/nonexistent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/sessions/validate/:token', () => {
    it('should validate a valid token', async () => {
      const createRes = await httpRequest('POST', '/api/sessions', { roles: ['user'] });
      const token = createRes.data.token;

      const res = await httpRequest('GET', `/api/sessions/validate/${token}`);
      expect(res.status).toBe(200);
      expect(res.data.token).toBe(token);
    });

    it('should return 404 for invalid token', async () => {
      const res = await httpRequest('GET', '/api/sessions/validate/invalid_token_12345');
      expect(res.status).toBe(404);
    });
  });
});
