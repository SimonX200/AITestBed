import { execSync } from 'child_process';
import net from 'net';

let BASE_URL: string;
let testPort: number;

/**
 * Findet einen zufälligen freien Port im System.
 */
function getFreePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(0, () => {
            const port = (server.address() as any).port;
            server.close(() => resolve(port));
        });
        server.on('error', reject);
    });
}

/**
 * Führt einen HTTP-Request gegen die SessionManager API aus.
 */
async function apiRequest(path: string, options: {
    method?: string;
    body?: any;
}): Promise<{ status: number; data: any }> {
    const url = `${BASE_URL}${path}`;
    const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        headers: { 'Content-Type': 'application/json' },
    };
    if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    return { status: response.status, data };
}

beforeAll(async () => {
    // Finde zufälligen freien Port
    testPort = await getFreePort();
    process.env.EXAMPLE_SESSIONMANAGER_PORT = testPort.toString();
    BASE_URL = `http://localhost:${testPort}`;

    // Stoppe ggf. alte Container
    try {
        execSync('docker compose -f deploy/docker-compose.yaml down 2>/dev/null', {
            cwd: __dirname + '/..',
            stdio: 'pipe',
        });
    } catch { /* ignore */ }

    // Starte Docker Container
    console.log(`Starting Docker containers on port ${testPort}...`);
    execSync('bash deploy.sh start', {
        cwd: __dirname + '/..',
        env: { ...process.env, EXAMPLE_SESSIONMANAGER_PORT: testPort.toString() },
    });

    // Warte bis Container bereit sind (bis zu 40 Sekunden)
    let connected = false;
    for (let i = 0; i < 20; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
            if (res.ok) {
                connected = true;
                break;
            }
        } catch {
            // Ignoriere Fehler beim Warten
        }
    }
    if (!connected) {
        throw new Error('Container did not become ready in time');
    }
}, 60000);

afterAll(() => {
    // Stoppe Docker Container
    console.log('Stopping Docker containers...');
    try {
        execSync('bash deploy.sh stop', {
            cwd: __dirname + '/..',
            env: { ...process.env, EXAMPLE_SESSIONMANAGER_PORT: testPort.toString() },
            stdio: 'pipe',
        });
    } catch (e) {
        console.error('Error stopping containers:', e);
    }
});

describe('SessionManager E2E Tests', () => {
    describe('Health Check', () => {
        it('GET /health should return ok', async () => {
            const { status, data } = await apiRequest('/health', {});
            expect(status).toBe(200);
            expect(data.status).toBe('ok');
        });
    });

    describe('POST /sessions', () => {
        it('should create a new session', async () => {
            const { status, data } = await apiRequest('/sessions', {
                method: 'POST',
                body: { userId: 'e2e-user-1', roles: ['admin', 'user'] },
            });

            expect(status).toBe(201);
            expect(data.id).toBeDefined();
            expect(data.token).toBeDefined();
            expect(data.expiresAt).toBeDefined();
            expect(data.roles).toEqual(['admin', 'user']);
        });

        it('should return 400 when userId is missing', async () => {
            const { status } = await apiRequest('/sessions', {
                method: 'POST',
                body: { roles: ['admin'] },
            });

            expect(status).toBe(400);
        });

        it('should create session with empty roles', async () => {
            const { status, data } = await apiRequest('/sessions', {
                method: 'POST',
                body: { userId: 'e2e-user-2' },
            });

            expect(status).toBe(201);
            expect(data.roles).toEqual([]);
        });
    });

    describe('GET /sessions/:id', () => {
        let sessionId: string;

        beforeAll(async () => {
            const { data } = await apiRequest('/sessions', {
                method: 'POST',
                body: { userId: 'e2e-user-get', roles: ['viewer'] },
            });
            sessionId = data.id;
        });

        it('should return session by id', async () => {
            const { status, data } = await apiRequest(`/sessions/${sessionId}`, {});

            expect(status).toBe(200);
            expect(data.id).toBe(sessionId);
            expect(data.token).toBeDefined();
        });

        it('should return 404 for non-existent session', async () => {
            const { status } = await apiRequest('/sessions/non-existent-id', {});

            expect(status).toBe(404);
        });
    });

    describe('GET /sessions/:id/valid', () => {
        let validSessionId: string;
        let invalidSessionId = 'non-existent-id';

        beforeAll(async () => {
            const { data } = await apiRequest('/sessions', {
                method: 'POST',
                body: { userId: 'e2e-user-valid', roles: ['admin'] },
            });
            validSessionId = data.id;
        });

        it('should return valid=true for existing session', async () => {
            const { status, data } = await apiRequest(`/sessions/${validSessionId}/valid`, {});

            expect(status).toBe(200);
            expect(data.valid).toBe(true);
        });

        it('should return valid=false for non-existent session', async () => {
            const { status, data } = await apiRequest(`/sessions/${invalidSessionId}/valid`, {});

            expect(status).toBe(200);
            expect(data.valid).toBe(false);
        });
    });

    describe('DELETE /sessions/expired', () => {
        it('should clean up expired sessions and return count', async () => {
            const { status, data } = await apiRequest('/sessions/expired', {
                method: 'DELETE',
            });

            expect(status).toBe(200);
            expect(data.cleaned).toBeGreaterThanOrEqual(0);
        });
    });
});