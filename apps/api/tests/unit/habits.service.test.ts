import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as HabitsService from '../../src/modules/habits/habits.service.js';
import { prisma } from '../../src/config/database.js';

// Mockear prisma singleton
vi.mock('../../src/config/database.js', () => {
  return {
    prisma: {
      habitSettings: {
        upsert: vi.fn(),
        update: vi.fn(),
      },
      habitDay: {
        findMany: vi.fn(),
      },
    },
  };
});

describe('HabitsService - Unit Tests', () => {
  const userId = 'user-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSettings', () => {
    it('debería hacer un upsert para retornar la configuración del usuario', async () => {
      vi.mocked(prisma.habitSettings.upsert).mockResolvedValue({
        id: 'settings-1',
        userId,
        minTasksCompleted: 1,
        minMinutesWorked: 30,
        criteriaType: 'tasks',
      } as any);

      const result = await HabitsService.getSettings(userId);

      expect(result.id).toBe('settings-1');
      expect(prisma.habitSettings.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          create: { userId },
        })
      );
    });
  });

  describe('updateSettings', () => {
    it('debería actualizar los parámetros especificados del hábito', async () => {
      vi.mocked(prisma.habitSettings.update).mockResolvedValue({
        id: 'settings-1',
        userId,
        minTasksCompleted: 3,
        minMinutesWorked: 45,
        criteriaType: 'both',
      } as any);

      const result = await HabitsService.updateSettings(userId, {
        minTasksCompleted: 3,
        minMinutesWorked: 45,
        criteriaType: 'both',
      });

      expect(result.minTasksCompleted).toBe(3);
      expect(result.criteriaType).toBe('both');
      expect(prisma.habitSettings.update).toHaveBeenCalled();
    });
  });
});
