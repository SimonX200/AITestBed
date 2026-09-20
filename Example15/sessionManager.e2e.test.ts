import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

describe('SessionManager E2E Tests - Docker Container', () => {
  let sessionId: string;
  let sessionToken: string;

  beforeAll(async () => {
    for (let i = 0; i < 30; i++) {
      try {
        await axios.get(`${BASE_URL}/sessions`);
        return;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Container not ready after 30 seconds');
  }, 35000);

  afterAll(async () => {
    try {
      if (sessionId) {
        await axios.delete(`${BASE_URL}/sessions/${sessionId}`);
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('POST /api/sessions - Create session', () => {
    it('should create a new session with valid data', async () => {
      const response = await axios.post(`${BASE_URL}/sessions`, {
        id: 'e2e-user-1',
        token: 'e2e-token-abc-123',
        expiresInMinutes: 30,
        roles: ['admin', 'user'],
      });
      expect(response.status).toBe(201);
      expect(response.data.message).toBe('Session created');
      expect(response.data.session).toBeDefined();
      expect(response.data.session.id).toBe('e2e-user-1');
      expect(response.data.session.token).toBe('e2e-token-abc-123');
      expect(response.data.session.roles).toEqual(['admin', 'user']);
      expect(response.data.session.expiresAt).toBeDefined();
      sessionId = response.data.session.id;
      sessionToken = response.data.session.token;
    });

    it('should return 400 if id is missing', async () => {
      await expect(
        axios.post(`${BASE_URL}/sessions`, { token: 'token123' })
      ).rejects.toThrow('400');
    });

    it('should return 400 if token is missing', async () => {
      await expect(
        axios.post(`${BASE_URL}/sessions`, { id: 'user1' })
      ).rejects.toThrow('400');
    });

    it('should use default roles when not provided', async () => {
      const response = await axios.post(`${BASE_URL}/sessions`, {
        id: 'e2e-user-default',
        token: 'default-token',
      });
      expect(response.status).toBe(201);
      expect(response.data.session.roles).toEqual(['user']);
    });
  });

  describe('GET /api/sessions/:id - Get session', () => {
    it('should return session by id', async () => {
      const response = await axios.get(`${BASE_URL}/sessions/e2e-user-1`);
      expect(response.status).toBe(200);
      expect(response.data.id).toBe('e2e-user-1');
      expect(response.data.token).toBe('e2e-token-abc-123');
      expect(response.data.roles).toEqual(['admin', 'user']);
    });

    it('should return 404 for non-existent session', async () => {
      await expect(
        axios.get(`${BASE_URL}/sessions/non-existent-id`)
      ).rejects.toThrow('404');
    });
  });

  describe('GET /api/sessions/:id/valid - Check session validity', () => {
    it('should return valid=true for active session', async () => {
      const response = await axios.get(`${BASE_URL}/sessions/e2e-user-1/valid`);
      expect(response.status).toBe(200);
      expect(response.data.valid).toBe(true);
    });

    it('should return valid=false for non-existent session', async () => {
      const response = await axios.get(`${BASE_URL}/sessions/non-existent-id/valid`);
      expect(response.status).toBe(200);
      expect(response.data.valid).toBe(false);
    });
  });

  describe('GET /api/sessions/:id/role/:role - Check session role', () => {
    it('should return hasRole=true when user has the role', async () => {
      const response = await axios.get(`${BASE_URL}/sessions/e2e-user-1/role/admin`);
      expect(response.status).toBe(200);
      expect(response.data.hasRole).toBe(true);
      expect(response.data.role).toBe('admin');
    });

    it('should return hasRole=false when user does not have the role', async () => {
      const response = await axios.get(`${BASE_URL}/sessions/e2e-user-1/role/moderator`);
      expect(response.status).toBe(200);
      expect(response.data.hasRole).toBe(false);
    });
  });

  describe('DELETE /api/sessions/:id - Remove session', () => {
    it('should remove an existing session', async () => {
      const createResp = await axios.post(`${BASE_URL}/sessions`, {
        id: 'e2e-delete-me',
        token: 'delete-token',
      });
      expect(createResp.status).toBe(201);

      const deleteResp = await axios.delete(`${BASE_URL}/sessions/e2e-delete-me`);
      expect(deleteResp.status).toBe(200);
      expect(deleteResp.data.message).toBe('Session removed');

      await expect(
        axios.get(`${BASE_URL}/sessions/e2e-delete-me`)
      ).rejects.toThrow('404');
    });

    it('should return 404 for non-existent session', async () => {
      await expect(
        axios.delete(`${BASE_URL}/sessions/non-existent-id`)
      ).rejects.toThrow('404');
    });
  });

  describe('GET /api/sessions - List all sessions', () => {
    it('should return all active sessions', async () => {
      const response = await axios.get(`${BASE_URL}/sessions`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('count');
      expect(response.data).toHaveProperty('sessions');
      expect(Array.isArray(response.data.sessions)).toBe(true);
      expect(response.data.count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/sessions/cleanup - Manual cleanup', () => {
    it('should trigger cleanup and return removed count', async () => {
      const response = await axios.post(`${BASE_URL}/sessions/cleanup`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message', 'Cleanup completed');
      expect(response.data).toHaveProperty('removed');
      expect(typeof response.data.removed).toBe('number');
    });
  });
});
