/**
 * E2E Tests für SessionManager gegen laufenden Docker Container
 *
 * Testet alle HTTP-Endpunkte über einen laufenden Container.
 * Der Container wird über die Environment-Variable Example_SessionManager_Port konfiguriert.
 */

const BASE_URL = `http://localhost:${process.env.Example_SessionManager_Port || 3000}`;

let serverAvailable = false;

describe('SessionManager E2E Tests', () => {
  const httpRequest = (options: { method: string; path: string; body?: any }, timeout = 5000): Promise<{ status: number; body: any }> => {
    return new Promise((resolve, reject) => {
      const url = new URL(options.path, BASE_URL);
      const mod = require('http');
      const req = mod.request(
        { hostname: url.hostname, port: url.port || 3000, method: options.method, path: url.pathname, timeout },
        (res: any) => {
          let data = '';
          res.on('data', (chunk: string) => { data += chunk; });
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, body: JSON.parse(data) });
            } catch {
              resolve({ status: res.statusCode, body: data });
            }
          });
        }
      );
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
      if (options.body) req.write(JSON.stringify(options.body));
      req.end();
    });
  };

  beforeAll(async () => {
    try {
      const res = await httpRequest({ method: 'GET', path: '/health' }, 3000);
      serverAvailable = res.status === 200;
    } catch {
      serverAvailable = false;
    }
    if (!serverAvailable) {
      console.warn('[E2E SKIP] Server not running at ' + BASE_URL + '. Run: npm run e2e');
    }
  }, 10000);

  describe('POST /sessions', () => {
    it('sollte eine neue Session erstellen', async () => {
      if (!serverAvailable) return;
      const res = await httpRequest({ method: 'POST', path: '/sessions', body: { token: 'e2e-token', roles: ['admin', 'user'] } });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('token', 'e2e-token');
      expect(res.body).toHaveProperty('roles', ['admin', 'user']);
      expect(res.body).toHaveProperty('expiresAt');
      return res.body;
    }, 10000);

    it('sollte 400 zurückgeben ohne token', async () => {
      if (!serverAvailable) return;
      const res = await httpRequest({ method: 'POST', path: '/sessions', body: { roles: ['admin'] } });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('sollte 400 bei ungültigem JSON zurückgeben', async () => {
      if (!serverAvailable) return;
      return new Promise((resolve, reject) => {
        const url = new URL('/sessions', BASE_URL);
        const mod = require('http');
        const req = mod.request(
          { hostname: url.hostname, port: url.port || 3000, method: 'POST', path: url.pathname },
          (res: any) => {
            let data = '';
            res.on('data', (chunk: string) => { data += chunk; });
            res.on('end', () => {
              expect(res.statusCode).toBe(400);
              resolve(undefined);
            });
          }
        );
        req.write('not json');
        req.end();
      });
    });
  });

  describe('GET /sessions/:id', () => {
    let createdSessionId: string;

    beforeAll(async () => {
      if (!serverAvailable) return;
      const res = await httpRequest({ method: 'POST', path: '/sessions', body: { token: 'e2e-get-token', roles: ['test'] } });
      createdSessionId = res.body.id;
    }, 10000);

    it('sollte eine existierende Session zurückgeben', async () => {
      if (!serverAvailable) return;
      const res = await httpRequest({ method: 'GET', path: `/sessions/${createdSessionId}` });
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdSessionId);
      expect(res.body.token).toBe('e2e-get-token');
    });

    it('sollte 404 für nicht existierende Session zurückgeben', async () => {
      if (!serverAvailable) return;
      const res = await httpRequest({ method: 'GET', path: '/sessions/non-existent-id' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /sessions/:id', () => {
    let createdSessionId: string;

    beforeAll(async () => {
      if (!serverAvailable) return;
      const res = await httpRequest({ method: 'POST', path: '/sessions', body: { token: 'e2e-delete-token', roles: ['delete-test'] } });
      createdSessionId = res.body.id;
    }, 10000);

    it('sollte eine existierende Session löschen', async () => {
      if (!serverAvailable) return;
      const res = await httpRequest({ method: 'DELETE', path: `/sessions/${createdSessionId}` });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('sollte 404 für nicht existierende Session zurückgeben', async () => {
      if (!serverAvailable) return;
      const res = await httpRequest({ method: 'DELETE', path: '/sessions/non-existent-id' });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /sessions', () => {
    it('sollte alle Sessions zurückgeben', async () => {
      if (!serverAvailable) return;
      await httpRequest({ method: 'POST', path: '/sessions', body: { token: 'e2e-list-token', roles: ['list-test'] } });
      const res = await httpRequest({ method: 'GET', path: '/sessions' });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /sessions/cleanup', () => {
    it('sollte manuelles Cleanup auslösen', async () => {
      if (!serverAvailable) return;
      const res = await httpRequest({ method: 'POST', path: '/sessions/cleanup' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('removed');
      expect(typeof res.body.removed).toBe('number');
    });
  });

  describe('GET /health', () => {
    it('sollte Health-Status zurückgeben', async () => {
      if (!serverAvailable) return;
      const res = await httpRequest({ method: 'GET', path: '/health' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body).toHaveProperty('activeSessions');
    });
  });

  describe('404 für unbekannte Endpunkte', () => {
    it('sollte 404 für /unknown zurückgeben', async () => {
      if (!serverAvailable) return;
      const res = await httpRequest({ method: 'GET', path: '/unknown' });
      expect(res.status).toBe(404);
    });

    it('sollte 404 für /api/v1/test zurückgeben', async () => {
      if (!serverAvailable) return;
      const res = await httpRequest({ method: 'GET', path: '/api/v1/test' });
      expect(res.status).toBe(404);
    });
  });
});
