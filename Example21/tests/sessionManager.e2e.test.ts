import * as http from 'http';

const BASE_URL = `http://localhost:${process.env.EXAMPLE_SESSIONMANAGER_PORT || 3000}`;

function httpRequest(method: string, path: string, body?: unknown): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? require('https') : http;

    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = lib.request(options, (res: http.IncomingMessage) => {
      let data = '';
      res.on('data', (chunk: string) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode!, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode!, data: { raw: data } });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => { reject(new Error('Request timeout')); req.destroy(); });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

describe('SessionManager E2E Tests', () => {
  describe('Health Check', () => {
    it('GET /health should return ok', async () => {
      const res = await httpRequest('GET', '/health');
      expect(res.status).toBe(200);
      expect((res.data as any).status).toBe('ok');
    });
  });

  describe('Create Session', () => {
    it('POST /api/sessions should create a session', async () => {
      const res = await httpRequest('POST', '/api/sessions', {
        userId: 'e2e-user-1',
        roles: ['user', 'tester'],
        durationMinutes: 60,
      });
      expect(res.status).toBe(201);
      const data = (res.data as any).data;
      expect(data.id).toBeDefined();
      expect(data.token).toBeDefined();
      expect(data.userId || data.id).toBeDefined();
      expect(data.roles).toEqual(['user', 'tester']);
      expect(data.expiresAt).toBeDefined();
    });

    it('POST /api/sessions should return 400 without userId', async () => {
      const res = await httpRequest('POST', '/api/sessions', {});
      expect(res.status).toBe(400);
    });
  });

  describe('Get Session', () => {
    let sessionId: string;
    let sessionToken: string;

    beforeAll(async () => {
      const res = await httpRequest('POST', '/api/sessions', { userId: 'e2e-get-user' });
      const data = (res.data as any).data;
      sessionId = data.id;
      sessionToken = data.token;
    });

    it('GET /api/sessions/:id should return session', async () => {
      const res = await httpRequest('GET', `/api/sessions/${sessionId}`);
      expect(res.status).toBe(200);
      expect((res.data as any).data.id).toBe(sessionId);
    });

    it('GET /api/sessions/:id should return 404 for non-existent', async () => {
      const res = await httpRequest('GET', '/api/sessions/non-existent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('Validate Session', () => {
    let sessionId: string;
    let sessionToken: string;

    beforeAll(async () => {
      const res = await httpRequest('POST', '/api/sessions', { userId: 'e2e-validate-user' });
      const data = (res.data as any).data;
      sessionId = data.id;
      sessionToken = data.token;
    });

    it('POST /api/sessions/:id/validate should return valid=true with correct token', async () => {
      const res = await httpRequest('POST', `/api/sessions/${sessionId}/validate`, {
        token: sessionToken,
      });
      expect(res.status).toBe(200);
      expect((res.data as any).data.valid).toBe(true);
    });

    it('POST /api/sessions/:id/validate should return valid=false with wrong token', async () => {
      const res = await httpRequest('POST', `/api/sessions/${sessionId}/validate`, {
        token: 'wrong-token',
      });
      expect(res.status).toBe(200);
      expect((res.data as any).data.valid).toBe(false);
    });
  });

  describe('Delete Session', () => {
    let sessionId: string;

    beforeAll(async () => {
      const res = await httpRequest('POST', '/api/sessions', { userId: 'e2e-delete-user' });
      const data = (res.data as any).data;
      sessionId = data.id;
    });

    it('DELETE /api/sessions/:id should delete session', async () => {
      const res = await httpRequest('DELETE', `/api/sessions/${sessionId}`);
      expect(res.status).toBe(200);
      expect((res.data as any).data.deleted).toBe(true);
    });

    it('DELETE /api/sessions/:id should return 404 for already deleted', async () => {
      const res = await httpRequest('DELETE', `/api/sessions/${sessionId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Cleanup Expired', () => {
    it('POST /api/sessions/cleanup should return cleaned count', async () => {
      const res = await httpRequest('POST', '/api/sessions/cleanup', {});
      expect(res.status).toBe(200);
      expect((res.data as any).data.cleanedUp).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Get All Sessions', () => {
    it('GET /api/sessions should return list of sessions', async () => {
      // Create a session first
      await httpRequest('POST', '/api/sessions', { userId: 'e2e-list-user' });
      const res = await httpRequest('GET', '/api/sessions');
      expect(res.status).toBe(200);
      expect(Array.isArray((res.data as any).data)).toBe(true);
    });
  });
});
