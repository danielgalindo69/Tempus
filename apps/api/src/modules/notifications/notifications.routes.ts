import { FastifyInstance } from 'fastify';
import { authenticate } from '../../shared/middleware/authenticate.js';
import * as NotificationsController from './notifications.controller.js';

export async function notificationsRoutes(app: FastifyInstance): Promise<void> {
  app.register(async (protectedApp) => {
    protectedApp.addHook('onRequest', authenticate);

    protectedApp.get('/', NotificationsController.getNotifications);
    protectedApp.patch('/read', NotificationsController.markAsRead);
    protectedApp.delete('/:id', NotificationsController.deleteNotification);
    
    // Suscripciones push
    protectedApp.post('/push/subscribe', NotificationsController.subscribePush);
    protectedApp.post('/push/unsubscribe', NotificationsController.unsubscribePush);
  });
}
