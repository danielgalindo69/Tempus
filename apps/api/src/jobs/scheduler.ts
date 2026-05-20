import cron from 'node-cron';
import { runDailySummaryJob } from './daily-summary.job.js';
import { runStreakUpdateJob } from './streak-update.job.js';
import { runNotificationsJob } from './notifications.job.js';

export function startScheduler(): void {
  console.log('[Scheduler] Inicializando planificador de tareas programadas (jobs)...');

  // 1. Daily Summary Job — Se ejecuta todos los días a las 23:55
  cron.schedule('55 23 * * *', async () => {
    console.log('[Scheduler] Disparando Daily Summary Job (23:55)...');
    await runDailySummaryJob();
  });

  // 2. Streak Update Job — Se ejecuta todos los días a las 00:05
  cron.schedule('5 0 * * *', async () => {
    console.log('[Scheduler] Disparando Streak Update Job (00:05)...');
    await runStreakUpdateJob();
  });

  // 3. Notifications Job — Se ejecuta cada minuto
  cron.schedule('*/1 * * * *', async () => {
    // Evitamos llenar la consola con logs cada minuto, se ejecuta silenciosamente a menos que haya notificaciones
    await runNotificationsJob();
  });

  console.log('[Scheduler] Planificador configurado. 3 Jobs listos.');
}
