import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as TimeSessionsService from '../../src/modules/time-sessions/time-sessions.service.js';
import { prisma } from '../../src/config/database.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../../src/shared/errors.js';

// Mockear prisma singleton
vi.mock('../../src/config/database.js', () => {
  return {
    prisma: {
      timeSession: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      task: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(prisma)),
    },
  };
});

describe('TimeSessionsService - Unit Tests', () => {
  const userId = 'user-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startSession', () => {
    it('debería lanzar NotFoundError si la tarea no existe', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue(null);

      await expect(
        TimeSessionsService.startSession(userId, { taskId: 'not-exists' })
      ).rejects.toThrow(NotFoundError);
    });

    it('debería auto-cerrar la sesión activa previa si existe antes de iniciar la nueva', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({ id: 'task-new', userId, status: 'planned' } as any);
      
      // Sesión activa anterior
      vi.mocked(prisma.timeSession.findFirst).mockResolvedValue({
        id: 'active-session-old',
        startedAt: new Date(Date.now() - 3600 * 1000), // Hace 1 hora
      } as any);

      vi.mocked(prisma.timeSession.create).mockResolvedValue({
        id: 'session-new',
        taskId: 'task-new',
      } as any);

      const result = await TimeSessionsService.startSession(userId, { taskId: 'task-new' });

      expect(result.id).toBe('session-new');
      
      // Debe haber cerrado la anterior
      expect(prisma.timeSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'active-session-old' },
          data: expect.objectContaining({
            endedAt: expect.any(Date),
            durationSeconds: expect.any(Number),
          }),
        })
      );
      
      // Debe haber marcado la tarea como in_progress
      expect(prisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-new' },
          data: { status: 'in_progress' },
        })
      );
      
      // Debe haber creado la nueva sesión
      expect(prisma.timeSession.create).toHaveBeenCalled();
    });
  });

  describe('stopSession', () => {
    it('debería lanzar ConflictError si no hay sesión activa y no se especificó un ID', async () => {
      vi.mocked(prisma.timeSession.findFirst).mockResolvedValue(null);

      await expect(
        TimeSessionsService.stopSession(userId, {})
      ).rejects.toThrow(ConflictError);
    });

    it('debería cerrar la sesión activa del usuario correctamente', async () => {
      const mockActive = {
        id: 'active-1',
        startedAt: new Date(Date.now() - 60 * 1000), // Hace 1 min
        userId,
      };

      vi.mocked(prisma.timeSession.findFirst).mockResolvedValue(mockActive as any);
      vi.mocked(prisma.timeSession.update).mockResolvedValue({
        ...mockActive,
        endedAt: new Date(),
        durationSeconds: 60,
      } as any);

      const result = await TimeSessionsService.stopSession(userId, { note: 'Buen avance' });

      expect(result.durationSeconds).toBe(60);
      expect(prisma.timeSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'active-1' },
          data: expect.objectContaining({
            endedAt: expect.any(Date),
            note: 'Buen avance',
          }),
        })
      );
    });
  });
});
