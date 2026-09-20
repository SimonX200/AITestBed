const http = require('http');

const BASE_URL = 'http://localhost:3000';

function httpGet(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error(`Request to ${path} timed out`));
    });
  });
}

function httpPost(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(
      `${BASE_URL}${path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('POST timeout')); });
    req.write(payload);
    req.end();
  });
}

describe('E2E — Session Manager Container', () => {
  beforeAll(async () => {
    await new Promise((r) => setTimeout(r, 2000));
  }, 15000);

  test('container is reachable (health check)', async () => {
    const res = await httpGet('/health');
    expect(res.statusCode).toBe(200);
  });

  test('GET /sessions returns 200 with JSON array', async () => {
    const res = await httpGet('/sessions');
    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(Array.isArray(json)).toBe(true);
  });

  test('POST /sessions creates a session and returns 201', async () => {
    const res = await httpPost('/sessions', {
      id: 'e2e-test-1',
      token: 'e2e-token-xyz',
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      roles: ['e2e-user'],
    });
    expect(res.statusCode).toBe(201);
    const json = JSON.parse(res.body);
    expect(json.id).toBe('e2e-test-1');
  });

  test('GET /sessions/<id> returns the created session', async () => {
    const res = await httpGet('/sessions/e2e-test-1');
    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(json.id).toBe('e2e-test-1');
  });

  test('GET /sessions/<unknown-id> returns 404', async () => {
    const res = await httpGet('/sessions/nonexistent-e2e');
    expect(res.statusCode).toBe(404);
  });
});