import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as TasksService from '../../src/modules/tasks/tasks.service.js';
import { prisma } from '../../src/config/database.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../../src/shared/errors.js';

// Mockear prisma singleton
vi.mock('../../src/config/database.js', () => {
  return {
    prisma: {
      task: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      systemCategory: {
        findUnique: vi.fn(),
      },
      userCategory: {
        findUnique: vi.fn(),
      },
      tag: {
        findMany: vi.fn(),
      },
      taskTag: {
        deleteMany: vi.fn(),
      },
      taskAttachment: {
        count: vi.fn(),
        create: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
      notification: {
        deleteMany: vi.fn(),
        create: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(prisma)),
    },
  };
});

describe('TasksService - Unit Tests', () => {
  const userId = 'user-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTask', () => {
    it('debería lanzar ValidationError si endTime <= startTime', async () => {
      await expect(
        TasksService.createTask(userId, {
          title: 'Test Task',
          scheduledDate: '2026-05-20',
          startTime: '2026-05-20T12:00:00.000Z',
          endTime: '2026-05-20T11:00:00.000Z',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('debería lanzar ValidationError si se especifican categorías del sistema y de usuario juntas', async () => {
      await expect(
        TasksService.createTask(userId, {
          title: 'Test Task',
          scheduledDate: '2026-05-20',
          systemCategoryId: 'sys-cat-1',
          userCategoryId: 'user-cat-1',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('debería crear una tarea exitosamente y asignarle la siguiente posición', async () => {
      vi.mocked(prisma.task.findFirst).mockResolvedValue({ position: 5 } as any);
      vi.mocked(prisma.task.create).mockResolvedValue({
        id: 'task-1',
        userId,
        title: 'New Task',
        position: 6,
        scheduledDate: new Date('2026-05-20'),
        taskTags: [],
      } as any);

      const result = await TasksService.createTask(userId, {
        title: 'New Task',
        scheduledDate: '2026-05-20',
      });

      expect(result.id).toBe('task-1');
      expect(result.position).toBe(6);
      expect(prisma.task.create).toHaveBeenCalled();
    });
  });

  describe('updateTask status transitions', () => {
    it('debería lanzar ValidationError si intenta transicionar de planned a done directamente', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        userId,
        status: 'planned',
      } as any);

      await expect(
        TasksService.updateTask(userId, 'task-1', {
          status: 'done',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('debería lanzar ValidationError si intenta transicionar de done a planned directamente', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        userId,
        status: 'done',
      } as any);

      await expect(
        TasksService.updateTask(userId, 'task-1', {
          status: 'planned',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('debería permitir transiciones válidas (ej. planned a in_progress)', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        userId,
        status: 'planned',
        recurrence: null,
      } as any);
      vi.mocked(prisma.task.update).mockResolvedValue({
        id: 'task-1',
        status: 'in_progress',
        taskTags: [],
      } as any);

      const result = await TasksService.updateTask(userId, 'task-1', {
        status: 'in_progress',
      });
      expect(result.status).toBe('in_progress');
    });
  });

  describe('updateTaskStatus transitions', () => {
    it('debería lanzar ValidationError si intenta transicionar de planned a done directamente', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        userId,
        status: 'planned',
      } as any);

      await expect(
        TasksService.updateTaskStatus(userId, 'task-1', 'done')
      ).rejects.toThrow(ValidationError);
    });

    it('debería lanzar ValidationError si intenta transicionar de done a planned directamente', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        userId,
        status: 'done',
      } as any);

      await expect(
        TasksService.updateTaskStatus(userId, 'task-1', 'planned')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('addAttachment', () => {
    it('debería lanzar ValidationError si la tarea ya tiene 3 adjuntos', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({ id: 'task-1', userId } as any);
      vi.mocked(prisma.taskAttachment.count).mockResolvedValue(3);

      await expect(
        TasksService.addAttachment(userId, 'task-1', {
          type: 'link',
          url: 'https://example.com',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('debería agregar el adjunto si tiene menos de 3', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({ id: 'task-1', userId } as any);
      vi.mocked(prisma.taskAttachment.count).mockResolvedValue(1);
      vi.mocked(prisma.taskAttachment.create).mockResolvedValue({
        id: 'attach-1',
        url: 'https://example.com',
      } as any);

      const result = await TasksService.addAttachment(userId, 'task-1', {
        type: 'link',
        url: 'https://example.com',
      });

      expect(result.id).toBe('attach-1');
      expect(prisma.taskAttachment.create).toHaveBeenCalled();
    });
  });
});
