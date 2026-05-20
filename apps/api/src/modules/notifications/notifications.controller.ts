import { FastifyRequest, FastifyReply } from 'fastify';
import * as NotificationsService from './notifications.service.js';
import {
  NotificationQuerySchema,
  MarkNotificationsReadSchema,
  PushSubscribeSchema,
  PushUnsubscribeSchema
} from './notifications.schema.js';

export async function getNotifications(request: FastifyRequest, reply: FastifyReply) {
  const query = NotificationQuerySchema.parse(request.query);
  const result = await NotificationsService.getNotifications(request.user.id, query);
  reply.send(result);
}

export async function markAsRead(request: FastifyRequest, reply: FastifyReply) {
  const { notificationIds } = MarkNotificationsReadSchema.parse(request.body);
  const notifications = await NotificationsService.markAsRead(request.user.id, notificationIds);
  reply.send({ notifications });
}

export async function deleteNotification(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  await NotificationsService.deleteNotification(request.user.id, id);
  reply.status(204).send();
}

export async function subscribePush(request: FastifyRequest, reply: FastifyReply) {
  const body = PushSubscribeSchema.parse(request.body);
  const subscription = await NotificationsService.subscribePush(request.user.id, body);
  reply.status(201).send({ subscription });
}

export async function unsubscribePush(request: FastifyRequest, reply: FastifyReply) {
  const body = PushUnsubscribeSchema.parse(request.body);
  await NotificationsService.unsubscribePush(request.user.id, body);
  reply.status(204).send();
}
