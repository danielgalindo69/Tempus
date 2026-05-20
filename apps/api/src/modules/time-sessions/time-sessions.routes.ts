import { FastifyInstance } from 'fastify';
import { authenticate } from '../../shared/middleware/authenticate.js';
import * as TimeSessionsController from './time-sessions.controller.js';

export async function timeSessionsRoutes(app: FastifyInstance): Promise<void> {
  app.register(async (protectedApp) => {
    protectedApp.addHook('onRequest', authenticate);

    protectedApp.get('/active', TimeSessionsController.getActiveSession);
    protectedApp.get('/', TimeSessionsController.getSessions);
    protectedApp.post('/start', TimeSessionsController.startSession);
    protectedApp.post('/stop', TimeSessionsController.stopSession);
    protectedApp.delete('/:id', TimeSessionsController.deleteSession);
  });
}
