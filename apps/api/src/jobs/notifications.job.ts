import webpush from 'web-push';
import { prisma } from '../config/database.js';
import { getEnv } from '../config/env.js';

let isWebPushConfigured = false;

// Configurar Web Push al inicializar el módulo
try {
  const env = getEnv();
  if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT) {
    webpush.setVapidDetails(
      env.VAPID_SUBJECT,
      env.VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY
    );
    isWebPushConfigured = true;
    console.log('[NotificationsJob] Credenciales Web Push (VAPID) cargadas con éxito.');
  } else {
    console.warn('[NotificationsJob] Advertencia: VAPID_PUBLIC_KEY o VAPID_PRIVATE_KEY no están configuradas en .env. Las notificaciones push reales se omitirán.');
  }
} catch (error: any) {
  console.error('[NotificationsJob] Error al inicializar configuración de Web Push:', error.message);
}

export async function runNotificationsJob(): Promise<void> {
  const now = new Date();
  
  try {
    // Buscar notificaciones programadas en el pasado o presente que no se hayan enviado aún
    const pendingNotifications = await prisma.notification.findMany({
      where: {
        isSent: false,
        scheduledFor: { lte: now }
      },
      include: {
        user: {
          include: {
            pushSubscriptions: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    if (pendingNotifications.length === 0) {
      return;
    }

    console.log(`[NotificationsJob] Enviando ${pendingNotifications.length} notificaciones programadas...`);

    for (const notification of pendingNotifications) {
      try {
        const payload = JSON.stringify({
          title: notification.title,
          body: notification.body ?? '',
          icon: '/assets/icon-192x192.png',
          data: {
            taskId: notification.taskId,
            type: notification.type
          }
        });

        // Enviar Web Push a todas las suscripciones activas de este usuario
        const subscriptions = notification.user.pushSubscriptions;

        if (subscriptions.length > 0 && isWebPushConfigured) {
          const sendPromises = subscriptions.map(async (sub) => {
            const pushSubscription = {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dhKey,
                auth: sub.authKey
              }
            };

            try {
              await webpush.sendNotification(pushSubscription, payload);
            } catch (err: any) {
              // Si la suscripción ha expirado (410) o no existe (404), la eliminamos de la base de datos
              if (err.statusCode === 410 || err.statusCode === 404) {
                console.log(`[NotificationsJob] Limpiando suscripción push expirada/inválida: ${sub.endpoint}`);
                await prisma.pushSubscription.delete({
                  where: { id: sub.id }
                });
              } else {
                console.error(`[NotificationsJob] Error al enviar push a sub ${sub.endpoint}:`, err.message);
              }
            }
          });

          await Promise.all(sendPromises);
        } else if (subscriptions.length > 0 && !isWebPushConfigured) {
          console.log(`[NotificationsJob] Saltando envío real para ${subscriptions.length} suscripciones del usuario ${notification.userId} (VAPID no configurado)`);
        }

        // Marcar la notificación como enviada en base de datos
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            isSent: true,
            sentAt: new Date()
          }
        });

      } catch (err: any) {
        console.error(`[NotificationsJob] Error al procesar notificación ${notification.id}:`, err.message);
      }
    }

    console.log('[NotificationsJob] Fin de procesamiento de notificaciones programadas.');
  } catch (error: any) {
    console.error('[NotificationsJob] Error general en el job de notificaciones:', error.message);
  }
}
