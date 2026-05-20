import { prisma } from '../../config/database.js';
import { parseDateString } from '../../shared/utils/date.js';
import type { UpdateHabitSettingsBody } from './habits.schema.js';

/**
 * Obtiene la configuración de hábitos del usuario, creándola si no existe
 */
export async function getSettings(userId: string) {
  return prisma.habitSettings.upsert({
    where: { userId },
    create: { userId },
    update: {}
  });
}

/**
 * Actualiza la configuración de hábitos del usuario
 */
export async function updateSettings(userId: string, data: UpdateHabitSettingsBody) {
  return prisma.habitSettings.update({
    where: { userId },
    data
  });
}

/**
 * Obtiene el historial de días de hábitos exitosos/fallidos del usuario en un rango de fechas
 */
export async function getHistory(userId: string, fromDateStr: string, toDateStr: string) {
  const fromDate = parseDateString(fromDateStr);
  const toDate = parseDateString(toDateStr);

  return prisma.habitDay.findMany({
    where: {
      userId,
      day: {
        gte: fromDate,
        lte: toDate
      }
    },
    orderBy: { day: 'desc' }
  });
}
