import { prisma } from '../config/database.js';
import { todayInTimezone, formatDate, parseDateString, addDaysToDate } from '../shared/utils/date.js';

export async function runStreakUpdateJob(): Promise<void> {
  console.log('[StreakUpdateJob] Iniciando procesamiento de streaks y gamificación...');

  try {
    const users = await prisma.user.findMany();

    for (const user of users) {
      try {
        // Ayer en la timezone del usuario
        const todayZoned = todayInTimezone(user.timezone);
        const yesterdayZoned = addDaysToDate(todayZoned, -1);
        const yesterdayStr = formatDate(yesterdayZoned, user.timezone);
        const yesterdayDate = parseDateString(yesterdayStr);

        // 1. Obtener la configuración del hábito del usuario (si no tiene, crear por defecto)
        const settings = await prisma.habitSettings.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {}
        });

        // 2. Obtener el DailySummary de ayer
        const summary = await prisma.dailySummary.findUnique({
          where: {
            userId_summaryDate: {
              userId: user.id,
              summaryDate: yesterdayDate
            }
          }
        });

        // 3. Determinar éxito del hábito de ayer
        let wasSuccessful = false;
        const tasksCompleted = summary?.tasksCompleted ?? 0;
        const minutesWorked = summary ? Math.floor(summary.totalTimeSeconds / 60) : 0;

        if (summary) {
          if (settings.criteriaType === 'tasks') {
            wasSuccessful = tasksCompleted >= settings.minTasksCompleted;
          } else if (settings.criteriaType === 'minutes') {
            wasSuccessful = minutesWorked >= settings.minMinutesWorked;
          } else if (settings.criteriaType === 'both') {
            wasSuccessful =
              tasksCompleted >= settings.minTasksCompleted &&
              minutesWorked >= settings.minMinutesWorked;
          }
        }

        // 4. Registrar o actualizar HabitDay para ayer
        await prisma.habitDay.upsert({
          where: {
            userId_day: {
              userId: user.id,
              day: yesterdayDate
            }
          },
          create: {
            userId: user.id,
            day: yesterdayDate,
            wasSuccessful,
            tasksCompleted,
            minutesWorked
          },
          update: {
            wasSuccessful,
            tasksCompleted,
            minutesWorked
          }
        });

        // 5. Cargar racha (streak) actual del usuario
        const streak = await prisma.streak.findUnique({
          where: { userId: user.id }
        });

        let currentStreak = streak?.currentStreak ?? 0;
        let longestStreak = streak?.longestStreak ?? 0;
        let treeHealth = streak?.treeHealth ?? 100;
        let treeStage = streak?.treeStage ?? 'seed';

        if (wasSuccessful) {
          // Incrementa la racha
          currentStreak += 1;
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
          // Regar el árbol (+10 salud, máx 100)
          treeHealth = Math.min(100, treeHealth + 10);
        } else {
          // Romper racha
          currentStreak = 0;
          // Dañar al árbol (-20 salud, mín 0)
          treeHealth = Math.max(0, treeHealth - 20);
        }

        // 6. Evolucionar etapa del árbol según la racha y salud
        if (treeHealth === 0) {
          // Si el árbol muere, vuelve a ser semilla
          treeStage = 'seed';
        } else {
          if (currentStreak >= 30) {
            treeStage = 'ancient';
          } else if (currentStreak >= 15) {
            treeStage = 'mature';
          } else if (currentStreak >= 7) {
            treeStage = 'young';
          } else if (currentStreak >= 3) {
            treeStage = 'sprout';
          } else {
            treeStage = 'seed';
          }
        }

        // 7. Upsert del Streak
        await prisma.streak.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            currentStreak,
            longestStreak,
            lastActiveDay: wasSuccessful ? yesterdayDate : null,
            treeStage,
            treeHealth
          },
          update: {
            currentStreak,
            longestStreak,
            lastActiveDay: wasSuccessful ? yesterdayDate : (streak?.lastActiveDay ?? null),
            treeStage,
            treeHealth
          }
        });

        console.log(
          `[StreakUpdateJob] Procesado streak para ${user.email}: Éxito=${wasSuccessful}, Racha=${currentStreak}, SaludÁrbol=${treeHealth}, Etapa=${treeStage}`
        );
      } catch (err: any) {
        console.error(`[StreakUpdateJob] Error procesando streak para usuario ${user.email}:`, err.message);
      }
    }

    console.log('[StreakUpdateJob] Procesamiento completado de streaks y gamificación.');
  } catch (error: any) {
    console.error('[StreakUpdateJob] Error crítico en Streak Update Job:', error.message);
  }
}
