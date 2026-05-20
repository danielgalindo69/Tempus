import { prisma } from '../../config/database.js';
import { parseDateString } from '../../shared/utils/date.js';

/**
 * Obtiene el resumen de agregaciones de DailySummary del usuario en un rango de fechas
 */
export async function getSummary(userId: string, fromDateStr: string, toDateStr: string) {
  const fromDate = parseDateString(fromDateStr);
  const toDate = parseDateString(toDateStr);

  const summaries = await prisma.dailySummary.findMany({
    where: {
      userId,
      summaryDate: {
        gte: fromDate,
        lte: toDate
      }
    }
  });

  const totalTasksPlanned = summaries.reduce((acc, curr) => acc + curr.tasksPlanned, 0);
  const totalTasksCompleted = summaries.reduce((acc, curr) => acc + curr.tasksCompleted, 0);
  const totalTimeSeconds = summaries.reduce((acc, curr) => acc + curr.totalTimeSeconds, 0);
  const totalEstimatedSeconds = summaries.reduce((acc, curr) => acc + curr.estimatedTimeSeconds, 0);
  const daysWithData = summaries.length;

  const averageCompletionRate = daysWithData > 0
    ? (summaries.reduce((acc, curr) => acc + curr.completionRate, 0) / daysWithData)
    : 0;

  return {
    totalTasksPlanned,
    totalTasksCompleted,
    totalTimeSeconds,
    totalEstimatedSeconds,
    averageCompletionRate,
    daysTracked: daysWithData
  };
}

/**
 * Obtiene la distribución de tiempo trabajado agrupado por categorías en un rango de fechas
 */
export async function getCategoryDistribution(userId: string, fromDateStr: string, toDateStr: string) {
  // Para las sesiones de tiempo, parseamos las fechas con el inicio/fin del día
  const fromDate = new Date(`${fromDateStr}T00:00:00.000Z`);
  const toDate = new Date(`${toDateStr}T23:59:59.999Z`);

  const sessions = await prisma.timeSession.findMany({
    where: {
      userId,
      startedAt: {
        gte: fromDate,
        lte: toDate
      },
      endedAt: { not: null },
      durationSeconds: { not: null }
    },
    include: {
      task: {
        include: {
          systemCategory: true,
          userCategory: true
        }
      }
    }
  });

  // Agrupamiento en memoria por ID de categoría
  const categoryMap = new Map<string, {
    name: string;
    colorHex: string;
    totalSeconds: number;
    type: 'system' | 'user';
  }>();

  let grandTotalSeconds = 0;

  for (const session of sessions) {
    const task = session.task;
    if (!task) continue;

    const duration = session.durationSeconds ?? 0;
    grandTotalSeconds += duration;

    if (task.systemCategory) {
      const cat = task.systemCategory;
      const existing = categoryMap.get(cat.id) || { name: cat.name, colorHex: '#94A3B8', totalSeconds: 0, type: 'system' };
      existing.totalSeconds += duration;
      categoryMap.set(cat.id, existing);
    } else if (task.userCategory) {
      const cat = task.userCategory;
      const existing = categoryMap.get(cat.id) || { name: cat.name, colorHex: cat.colorHex, totalSeconds: 0, type: 'user' };
      existing.totalSeconds += duration;
      categoryMap.set(cat.id, existing);
    } else {
      // Sin categoría asignada (Sin categoría)
      const uncategorizedId = 'uncategorized';
      const existing = categoryMap.get(uncategorizedId) || { name: 'Sin Categoría', colorHex: '#CBD5E1', totalSeconds: 0, type: 'system' };
      existing.totalSeconds += duration;
      categoryMap.set(uncategorizedId, existing);
    }
  }

  // Mapear el mapa a una lista con porcentajes
  const distribution = Array.from(categoryMap.entries()).map(([id, info]) => {
    const percentage = grandTotalSeconds > 0
      ? Number(((info.totalSeconds / grandTotalSeconds) * 100).toFixed(2))
      : 0;

    return {
      categoryId: id,
      name: info.name,
      colorHex: info.colorHex,
      totalSeconds: info.totalSeconds,
      percentage,
      type: info.type
    };
  });

  // Ordenar descendentemente por tiempo
  distribution.sort((a, b) => b.totalSeconds - a.totalSeconds);

  return {
    grandTotalSeconds,
    distribution
  };
}

/**
 * Obtiene el streak actual y estado de árbol del usuario
 */
export async function getStreakInfo(userId: string) {
  const streak = await prisma.streak.findUnique({
    where: { userId }
  });

  if (!streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDay: null,
      treeStage: 'seed',
      treeHealth: 100
    };
  }

  return streak;
}
