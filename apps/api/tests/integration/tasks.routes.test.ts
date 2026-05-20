import { describe, it, expect, vi, beforeEach } from 'vitest';
import fastify from 'fastify';
import jwt from 'jsonwebtoken';
import { buildApp } from '../../src/app.js';
import * as TasksService from '../../src/modules/tasks/tasks.service.js';

// Mockear el servicio de tareas
vi.mock('../../src/modules/tasks/tasks.service.js');

vi.mock('../../src/config/database.js', () => ({
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn(),
  prisma: {},
}));


describe('Tasks Routes - Integration Tests', () => {
  let app: any;
  let token: string;
  const userId = 'user-id-123';

  beforeEach(async () => {
    vi.clearAllMocks();
    app = fastify();
    await buildApp(app);

    // Firmar un JWT válido con el secreto configurado en setup.ts
    token = jwt.sign(
      { sub: userId, email: 'test@tempus.com', type: 'access' },
      'test_access_secret_key_extremely_long_and_secure'
    );
  });

  describe('GET /api/tasks', () => {
    it('debería retornar 401 si no se provee token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/tasks',
      });

      expect(response.statusCode).toBe(401);
    });

    it('debería retornar 200 y la lista de tareas si el token es válido', async () => {
      const mockTasks = [
        { id: 'task-1', title: 'Task 1', position: 0, tags: [] },
        { id: 'task-2', title: 'Task 2', position: 1, tags: [] },
      ];

      vi.mocked(TasksService.getTasks).mockResolvedValue(mockTasks as any);

      const response = await app.inject({
        method: 'GET',
        url: '/api/tasks',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.tasks).toHaveLength(2);
      expect(body.tasks[0].title).toBe('Task 1');
      expect(TasksService.getTasks).toHaveBeenCalledWith(userId, expect.any(Object));
    });
  });

  describe('POST /api/tasks', () => {
    it('debería retornar 201 y la tarea creada', async () => {
      const mockTask = { id: 'task-new', title: 'New task integration', tags: [] };

      vi.mocked(TasksService.createTask).mockResolvedValue(mockTask as any);

      const response = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          title: 'New task integration',
          scheduledDate: '2026-05-20',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.task.id).toBe('task-new');
      expect(TasksService.createTask).toHaveBeenCalledWith(userId, expect.objectContaining({
        title: 'New task integration',
        scheduledDate: '2026-05-20',
      }));
    });
  });
});
