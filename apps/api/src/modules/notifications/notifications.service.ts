import { prisma } from '../../config/database.js';
import { ForbiddenError, NotFoundError } from '../../shared/errors.js';
import { buildCursorClause, paginate } from '../../shared/utils/paginate.js';
import type {
  PushSubscribeBody,
  PushUnsubscribeBody,
  NotificationQueryQuery
} from './notifications.schema.js';

/**
 * Obtener notificaciones de usuario con paginación basada en cursor
 */
export async function getNotifications(userId: string, query: NotificationQueryQuery) {
  const limit = query.limit ?? 20;
  const cursorClause = buildCursorClause(query.cursor);

  const where: any = { userId };

  if (query.unreadOnly) {
    where.isRead = false;
  }

  // Obtenemos limit + 1 para determinar si hay más páginas
  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...cursorClause,
    include: {
      task: true
    }
  });

  return paginate(notifications, limit);
}

/**
 * Marcar notificaciones como leídas (específicas o todas)
 */
export async function markAsRead(userId: string, notificationIds?: string[]) {
  const where: any = {
    userId,
    isRead: false
  };

  if (notificationIds && notificationIds.length > 0) {
    where.id = { in: notificationIds };
  }

  await prisma.notification.updateMany({
    where,
    data: { isRead: true }
  });

  // Retornamos las notificaciones actualizadas
  return prisma.notification.findMany({
    where: {
      userId,
      id: notificationIds ? { in: notificationIds } : undefined
    },
    include: {
      task: true
    }
  });
}

/**
 * Eliminar una notificación
 */
export async function deleteNotification(userId: string, notificationId: string): Promise<void> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notification) throw new NotFoundError('Notificación no encontrada');
  if (notification.userId !== userId) throw new ForbiddenError('No tienes acceso a esta notificación');

  await prisma.notification.delete({
    where: { id: notificationId }
  });
}

/**
 * Suscribirse a notificaciones push (Web Push API)
 */
export async function subscribePush(userId: string, data: PushSubscribeBody) {
  return prisma.pushSubscription.upsert({
    where: { endpoint: data.endpoint },
    create: {
      userId,
      endpoint: data.endpoint,
      p256dhKey: data.p256dhKey,
      authKey: data.authKey,
      userAgent: data.userAgent ?? null,
      isActive: true
    },
    update: {
      userId,
      p256dhKey: data.p256dhKey,
      authKey: data.authKey,
      userAgent: data.userAgent ?? null,
      isActive: true
    }
  });
}

/**
 * Cancelar suscripción a notificaciones push
 */
export async function unsubscribePush(userId: string, data: PushUnsubscribeBody): Promise<void> {
  const sub = await prisma.pushSubscription.findUnique({
    where: { endpoint: data.endpoint }
  });

  if (!sub) throw new NotFoundError('Suscripción push no encontrada');
  if (sub.userId !== userId) throw new ForbiddenError('No tienes acceso a esta suscripción');

  await prisma.pushSubscription.delete({
    where: { endpoint: data.endpoint }
  });
}
