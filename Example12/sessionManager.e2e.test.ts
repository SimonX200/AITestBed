import { execSync } from 'child_process';
import * as http from 'http';

const BASE_URL = 'http://localhost:3000';

function httpGet(path: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 0, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode || 0, body: data });
        }
      });
    }).on('error', reject);
  });
}

function httpPost(path: string, body: object): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const fullUrl = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: fullUrl.hostname,
      port: fullUrl.port || 3000,
      path: fullUrl.pathname + fullUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 0, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode || 0, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

describe('E2E: Session Manager HTTP Endpoints', () => {
  beforeAll(() => {
    try {
      execSync(`curl -s --max-time 5 ${BASE_URL}/health`, { stdio: 'inherit' });
    } catch {
      throw new Error('Server is not running at ' + BASE_URL + '. Run: npm run e2e');
    }
  }, 10000);

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const result = await httpGet('/health');
      expect(result.status).toBe(200);
      expect(result.body.status).toBe('ok');
      expect(result.body.timestamp).toBeDefined();
    });
  });

  describe('POST /session/create', () => {
    it('should create a new session', async () => {
      const result = await httpPost('/session/create', {
        id: 'e2e-user-1',
        token: 'e2e-token-abc',
        expiresInMinutes: 30,
        roles: ['admin', 'user'],
      });
      expect(result.status).toBe(201);
      expect(result.body.message).toBe('Session created');
      expect(result.body.session.id).toBe('e2e-user-1');
      expect(result.body.session.roles).toEqual(['admin', 'user']);
    });

    it('should return 400 if id is missing', async () => {
      const result = await httpPost('/session/create', { token: 'token123' });
      expect(result.status).toBe(400);
      expect(result.body.error).toBeDefined();
    });

    it('should return 400 if token is missing', async () => {
      const result = await httpPost('/session/create', { id: 'user1' });
      expect(result.status).toBe(400);
      expect(result.body.error).toBeDefined();
    });
  });

  describe('GET /session/validate', () => {
    it('should return valid=true for an existing session', async () => {
      const result = await httpGet('/session/validate?id=e2e-user-1');
      expect(result.status).toBe(200);
      expect(result.body.id).toBe('e2e-user-1');
      expect(result.body.valid).toBe(true);
    });

    it('should return valid=false for a non-existent session', async () => {
      const result = await httpGet('/session/validate?id=nonexistent-session');
      expect(result.status).toBe(200);
      expect(result.body.valid).toBe(false);
    });

    it('should return 400 if id parameter is missing', async () => {
      const result = await httpGet('/session/validate');
      expect(result.status).toBe(400);
      expect(result.body.error).toBeDefined();
    });
  });

  describe('GET /session/get', () => {
    it('should return the session details', async () => {
      const result = await httpGet('/session/get?id=e2e-user-1');
      expect(result.status).toBe(200);
      expect(result.body.session.id).toBe('e2e-user-1');
      expect(result.body.session.roles).toEqual(['admin', 'user']);
      expect(result.body.session.expiresAt).toBeDefined();
    });

    it('should return 404 for a non-existent session', async () => {
      const result = await httpGet('/session/get?id=nonexistent-session');
      expect(result.status).toBe(404);
      expect(result.body.error).toBe('Session not found or expired');
    });
  });

  describe('POST /session/remove', () => {
    it('should remove an existing session', async () => {
      await httpPost('/session/create', {
        id: 'e2e-user-remove',
        token: 'token-remove',
        roles: ['user'],
      });
      const result = await httpPost('/session/remove?id=e2e-user-remove', {});
      expect(result.status).toBe(200);
      expect(result.body.removed).toBe(true);
      const check = await httpGet('/session/validate?id=e2e-user-remove');
      expect(check.body.valid).toBe(false);
    });

    it('should return 400 if id parameter is missing', async () => {
      const result = await httpPost('/session/remove', {});
      expect(result.status).toBe(400);
      expect(result.body.error).toBeDefined();
    });
  });

  describe('GET /session/list', () => {
    it('should return all active sessions', async () => {
      const result = await httpGet('/session/list');
      expect(result.status).toBe(200);
      expect(result.body.count).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(result.body.sessions)).toBe(true);
    });
  });

  describe('POST /session/cleanup', () => {
    it('should clean up expired sessions', async () => {
      const result = await httpPost('/session/cleanup', {});
      expect(result.status).toBe(200);
      expect(typeof result.body.removed).toBe('number');
    });
  });

  describe('GET /session/checkRole', () => {
    it('should return hasRole=true for a session with the role', async () => {
      const result = await httpGet('/session/checkRole?id=e2e-user-1&role=admin');
      expect(result.status).toBe(200);
      expect(result.body.hasRole).toBe(true);
      expect(result.body.id).toBe('e2e-user-1');
      expect(result.body.role).toBe('admin');
    });

    it('should return hasRole=false for a session without the role', async () => {
      const result = await httpGet('/session/checkRole?id=e2e-user-1&role=superadmin');
      expect(result.status).toBe(200);
      expect(result.body.hasRole).toBe(false);
    });

    it('should return 400 if parameters are missing', async () => {
      const result = await httpGet('/session/checkRole?id=e2e-user-1');
      expect(result.status).toBe(400);
    });
  });
});

