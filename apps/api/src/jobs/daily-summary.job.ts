import { prisma } from '../config/database.js';
import { parseDateString, todayInTimezone, formatDate } from '../shared/utils/date.js';

export async function runDailySummaryJob(): Promise<void> {
  console.log('[DailySummaryJob] Iniciando procesamiento de resúmenes diarios...');
  
  try {
    const users = await prisma.user.findMany();
    
    for (const user of users) {
      try {
        // Obtener la fecha "hoy" en la timezone del usuario
        const todayZoned = todayInTimezone(user.timezone);
        const dateStr = formatDate(todayZoned, user.timezone);
        const todayDate = parseDateString(dateStr); // Objeto Date UTC medianoche

        // Rango de fechas para las sesiones de tiempo (inicio y fin de hoy en la timezone del usuario)
        const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
        const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

        // 1. Tareas planificadas para hoy
        const tasksPlanned = await prisma.task.count({
          where: {
            userId: user.id,
            scheduledDate: todayDate
          }
        });

        // 2. Tareas completadas hoy
        const tasksCompleted = await prisma.task.count({
          where: {
            userId: user.id,
            scheduledDate: todayDate,
            status: 'done'
          }
        });

        // 3. Tiempo total trabajado en sesiones de tiempo hoy
        const sessions = await prisma.timeSession.findMany({
          where: {
            userId: user.id,
            startedAt: {
              gte: startOfDay,
              lte: endOfDay
            },
            endedAt: { not: null }
          }
        });
        const totalTimeSeconds = sessions.reduce((acc, curr) => acc + (curr.durationSeconds ?? 0), 0);

        // 4. Tiempo estimado total programado para hoy (en segundos)
        const tasksWithEstimate = await prisma.task.findMany({
          where: {
            userId: user.id,
            scheduledDate: todayDate,
            estimatedMinutes: { not: null }
          }
        });
        const estimatedTimeSeconds = tasksWithEstimate.reduce(
          (acc, curr) => acc + (curr.estimatedMinutes ?? 0) * 60,
          0
        );

        // 5. Tasa de completitud (%)
        const completionRate = tasksPlanned > 0
          ? Number(((tasksCompleted / tasksPlanned) * 100).toFixed(2))
          : 0;

        // Guardar o actualizar en DailySummary
        await prisma.dailySummary.upsert({
          where: {
            userId_summaryDate: {
              userId: user.id,
              summaryDate: todayDate
            }
          },
          create: {
            userId: user.id,
            summaryDate: todayDate,
            tasksPlanned,
            tasksCompleted,
            totalTimeSeconds,
            estimatedTimeSeconds,
            completionRate
          },
          update: {
            tasksPlanned,
            tasksCompleted,
            totalTimeSeconds,
            estimatedTimeSeconds,
            completionRate,
            calculatedAt: new Date()
          }
        });

        console.log(`[DailySummaryJob] Resumen diario procesado para usuario ${user.email} en fecha ${dateStr}`);
      } catch (err: any) {
        console.error(`[DailySummaryJob] Error procesando resumen para usuario ${user.email}:`, err.message);
      }
    }
    
    console.log('[DailySummaryJob] Procesamiento completado de resúmenes diarios.');
  } catch (error: any) {
    console.error('[DailySummaryJob] Error crítico en Daily Summary Job:', error.message);
  }
}
