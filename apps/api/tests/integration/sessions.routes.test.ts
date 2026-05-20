import { describe, it, expect, vi, beforeEach } from 'vitest';
import fastify from 'fastify';
import jwt from 'jsonwebtoken';
import { buildApp } from '../../src/app.js';
import * as TimeSessionsService from '../../src/modules/time-sessions/time-sessions.service.js';

// Mockear el servicio de sesiones de tiempo
vi.mock('../../src/modules/time-sessions/time-sessions.service.js');

vi.mock('../../src/config/database.js', () => ({
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn(),
  prisma: {},
}));


describe('Time Sessions Routes - Integration Tests', () => {
  let app: any;
  let token: string;
  const userId = 'user-id-123';

  beforeEach(async () => {
    vi.clearAllMocks();
    app = fastify();
    await buildApp(app);

    token = jwt.sign(
      { sub: userId, email: 'test@tempus.com', type: 'access' },
      'test_access_secret_key_extremely_long_and_secure'
    );
  });

  describe('GET /api/sessions/active', () => {
    it('debería retornar 200 y la sesión activa o null', async () => {
      const mockActive = { id: 'session-1', taskId: 'task-1', startedAt: new Date() };

      vi.mocked(TimeSessionsService.getActiveSession).mockResolvedValue(mockActive as any);

      const response = await app.inject({
        method: 'GET',
        url: '/api/sessions/active',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (response.statusCode === 500) {
        console.error('[sessions.routes.test] ERROR 500:', response.body);
      }
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.session.id).toBe('session-1');
      expect(TimeSessionsService.getActiveSession).toHaveBeenCalledWith(userId);
    });
  });

  describe('POST /api/sessions/start', () => {
    it('debería iniciar una sesión y retornar 201', async () => {
      const mockSession = { id: 'session-new', taskId: 'cjld2cyyt0000t3tz8yfgh71i' };

      vi.mocked(TimeSessionsService.startSession).mockResolvedValue(mockSession as any);

      const response = await app.inject({
        method: 'POST',
        url: '/api/sessions/start',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          taskId: 'cjld2cyyt0000t3tz8yfgh71i',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.session.id).toBe('session-new');
      expect(TimeSessionsService.startSession).toHaveBeenCalledWith(userId, { taskId: 'cjld2cyyt0000t3tz8yfgh71i' });
    });
  });
});
