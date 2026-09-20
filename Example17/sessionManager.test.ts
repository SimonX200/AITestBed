/**
 * Unit Tests für SessionManager
 * 
 * Testet alle Methoden der SessionManager-Klasse:
 * - addSession, getSession, isValid, removeSession
 * - getAllSessions, cleanupExpired, startCleanup, stopCleanup
 */

import { SessionManager, UserSession } from './sessionManager';

describe('SessionManager', () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager();
    manager.stopCleanup();
  });

  afterEach(() => {
    manager.stopCleanup();
  });

  describe('addSession', () => {
    it('sollte eine neue Session erstellen', () => {
      const session = manager.addSession('test-token', ['admin', 'user']);
      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.token).toBe('test-token');
      expect(session.roles).toEqual(['admin', 'user']);
      expect(session.expiresAt).toBeInstanceOf(Date);
    });

    it('sollte eine Session mit custom TTL erstellen', () => {
      const session = manager.addSession('test-token', ['admin'], 60);
      expect(session).toBeDefined();
      expect(session.id).toBeTruthy();
      expect(session.roles).toEqual(['admin']);
    });

    it('sollte eine eindeutige ID für jede Session generieren', () => {
      const s1 = manager.addSession('token1', ['role1']);
      const s2 = manager.addSession('token2', ['role2']);
      expect(s1.id).not.toBe(s2.id);
    });
  });

  describe('getSession', () => {
    it('sollte eine existierende Session zurückgeben', () => {
      const session = manager.addSession('test-token', ['admin']);
      const retrieved = manager.getSession(session.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(session.id);
      expect(retrieved!.token).toBe('test-token');
    });

    it('sollte null zurückgeben wenn Session nicht existiert', () => {
      expect(manager.getSession('non-existent-id')).toBeNull();
    });

    it('sollte abgelaufene Sessions als nicht gefunden behandeln', () => {
      const session = manager.addSession('test-token', ['admin'], -1);
      expect(manager.getSession(session.id)).toBeNull();
    });
  });

  describe('isValid', () => {
    it('sollte true zurückgeben für gültige Sessions', () => {
      const session = manager.addSession('test-token', ['admin']);
      expect(manager.isValid(session.id)).toBe(true);
    });

    it('sollte false zurückgeben für nicht existierende Sessions', () => {
      expect(manager.isValid('non-existent')).toBe(false);
    });
  });

  describe('removeSession', () => {
    it('sollte eine existierende Session entfernen', () => {
      const session = manager.addSession('test-token', ['admin']);
      const removed = manager.removeSession(session.id);
      expect(removed).toBe(true);
      expect(manager.getSession(session.id)).toBeNull();
    });

    it('sollte false zurückgeben wenn Session nicht existiert', () => {
      expect(manager.removeSession('non-existent')).toBe(false);
    });
  });

  describe('getAllSessions', () => {
    it('sollte alle aktiven Sessions zurückgeben', () => {
      manager.addSession('token1', ['admin']);
      manager.addSession('token2', ['user']);
      manager.addSession('token3', ['guest']);
      expect(manager.getAllSessions()).toHaveLength(3);
    });

    it('sollte abgelaufene Sessions nicht zurückgeben', () => {
      manager.addSession('token1', ['admin'], -1);
      manager.addSession('token2', ['user']);
      expect(manager.getAllSessions()).toHaveLength(1);
    });
  });

  describe('cleanupExpired', () => {
    it('sollte abgelaufene Sessions entfernen und Anzahl zurückgeben', () => {
      manager.addSession('token1', ['admin'], -1);
      manager.addSession('token2', ['user'], -1);
      manager.addSession('token3', ['guest']);
      const removed = manager.cleanupExpired();
      expect(removed).toBe(2);
      expect(manager.getAllSessions()).toHaveLength(1);
    });

    it('sollte 0 zurückgeben wenn keine abgelaufenen Sessions', () => {
      manager.addSession('token1', ['admin']);
      expect(manager.cleanupExpired()).toBe(0);
    });
  });

  describe('startCleanup / stopCleanup', () => {
    it('sollte Cleanup-Intervall starten und stoppen können', () => {
      manager.startCleanup();
      manager.stopCleanup();
      expect(() => manager.stopCleanup()).not.toThrow();
    });

    it('sollte automatisch abgelaufene Sessions entfernen', (done) => {
      manager.addSession('token1', ['admin'], 1);
      manager.startCleanup();
      setTimeout(() => {
        expect(manager.getAllSessions()).toHaveLength(0);
        manager.stopCleanup();
        done();
      }, 2000);
    }, 5000);
  });
  describe('startServer', () => {
    it('sollte HTTP-Server starten und Endpunkte bedienen', (done) => {
      const server = manager.startServer(0);
      const port = (server.address() as any).port;
      const req = require('http').request(
        { hostname: 'localhost', port, method: 'POST', path: '/sessions' },
        (res: any) => {
          let data = '';
          res.on('data', (chunk: string) => { data += chunk; });
          res.on('end', () => {
            const session = JSON.parse(data);
            expect(session).toHaveProperty('id');
            expect(session).toHaveProperty('token');
            expect(session).toHaveProperty('roles');
            expect(session).toHaveProperty('expiresAt');
            server.close();
            done();
          });
        }
      );
      req.write(JSON.stringify({ token: 'test-token', roles: ['admin'] }));
      req.end();
    });

    it('POST /sessions sollte 400 zurückgeben ohne token', (done) => {
      const server = manager.startServer(0);
      const port = (server.address() as any).port;
      const req = require('http').request(
        { hostname: 'localhost', port, method: 'POST', path: '/sessions' },
        (res: any) => {
          expect(res.statusCode).toBe(400);
          server.close();
          done();
        }
      );
      req.write(JSON.stringify({ roles: ['admin'] }));
      req.end();
    });

    it('GET /sessions/:id sollte Session zurückgeben', (done) => {
      const server = manager.startServer(0);
      const port = (server.address() as any).port;
      const createReq = require('http').request(
        { hostname: 'localhost', port, method: 'POST', path: '/sessions' },
        (res: any) => {
          let data = '';
          res.on('data', (chunk: string) => { data += chunk; });
          res.on('end', () => {
            const session = JSON.parse(data);
            require('http').get(`http://localhost:${port}/sessions/${session.id}`, (res2: any) => {
              let data2 = '';
              res2.on('data', (chunk: string) => { data2 += chunk; });
              res2.on('end', () => {
                const retrieved = JSON.parse(data2);
                expect(retrieved.id).toBe(session.id);
                server.close();
                done();
              });
            });
          });
        }
      );
      createReq.write(JSON.stringify({ token: 'test-token', roles: ['admin'] }));
      createReq.end();
    });

    it('GET /sessions sollte alle Sessions zurückgeben', (done) => {
      const server = manager.startServer(0);
      const port = (server.address() as any).port;
      const req = require('http').request(
        { hostname: 'localhost', port, method: 'POST', path: '/sessions' },
        (res: any) => {
          let data = '';
          res.on('data', (chunk: string) => { data += chunk; });
          res.on('end', () => {
            const session = JSON.parse(data);
            require('http').get(`http://localhost:${port}/sessions`, (res2: any) => {
              let data2 = '';
              res2.on('data', (chunk: string) => { data2 += chunk; });
              res2.on('end', () => {
                const sessions = JSON.parse(data2);
                expect(Array.isArray(sessions)).toBe(true);
                expect(sessions.length).toBeGreaterThanOrEqual(1);
                server.close();
                done();
              });
            });
          });
        }
      );
      req.write(JSON.stringify({ token: 'test-token', roles: ['admin'] }));
      req.end();
    });

    it('DELETE /sessions/:id sollte Session löschen', (done) => {
      const server = manager.startServer(0);
      const port = (server.address() as any).port;
      const req = require('http').request(
        { hostname: 'localhost', port, method: 'POST', path: '/sessions' },
        (res: any) => {
          let data = '';
          res.on('data', (chunk: string) => { data += chunk; });
          res.on('end', () => {
            const session = JSON.parse(data);
            const delReq = require('http').request(
              { hostname: 'localhost', port, method: 'DELETE', path: `/sessions/${session.id}` },
              (res2: any) => {
                let data2 = '';
                res2.on('data', (chunk: string) => { data2 += chunk; });
                res2.on('end', () => {
                  const result = JSON.parse(data2);
                  expect(result.success).toBe(true);
                  server.close();
                  done();
                });
              }
            );
            delReq.end();
          });
        }
      );
      req.write(JSON.stringify({ token: 'test-token', roles: ['admin'] }));
      req.end();
    });

    it('POST /sessions/cleanup sollte abgelaufene entfernen', (done) => {
      const server = manager.startServer(0);
      const port = (server.address() as any).port;
      const req = require('http').request(
        { hostname: 'localhost', port, method: 'POST', path: '/sessions' },
        (res: any) => {
          let data = '';
          res.on('data', (chunk: string) => { data += chunk; });
          res.on('end', () => {
            const cleanupReq = require('http').request(
              { hostname: 'localhost', port, method: 'POST', path: '/sessions/cleanup' },
              (res2: any) => {
                let data2 = '';
                res2.on('data', (chunk: string) => { data2 += chunk; });
                res2.on('end', () => {
                  const result = JSON.parse(data2);
                  expect(result).toHaveProperty('removed');
                  server.close();
                  done();
                });
              }
            );
            cleanupReq.end();
          });
        }
      );
      req.write(JSON.stringify({ token: 'test-token', roles: ['admin'] }));
      req.end();
    });

    it('GET /health sollte Status zurückgeben', (done) => {
      const server = manager.startServer(0);
      const port = (server.address() as any).port;
      require('http').get(`http://localhost:${port}/health`, (res: any) => {
        let data = '';
        res.on('data', (chunk: string) => { data += chunk; });
        res.on('end', () => {
          const health = JSON.parse(data);
          expect(health.status).toBe('ok');
          expect(health).toHaveProperty('activeSessions');
          server.close();
          done();
        });
      });
    });

    it('404 für unbekannte Endpunkte', (done) => {
      const server = manager.startServer(0);
      const port = (server.address() as any).port;
      require('http').get(`http://localhost:${port}/unknown`, (res: any) => {
        expect(res.statusCode).toBe(404);
        server.close();
        done();
      });
    });
  });
});
