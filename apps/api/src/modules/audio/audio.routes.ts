import { FastifyInstance } from 'fastify';
import { authenticate } from '../../shared/middleware/authenticate.js';
import * as AudioController from './audio.controller.js';

export async function audioRoutes(app: FastifyInstance): Promise<void> {
  app.register(async (protectedApp) => {
    protectedApp.addHook('onRequest', authenticate);

    protectedApp.get('/settings', AudioController.getSettings);
    protectedApp.put('/settings', AudioController.updateSettings);
    protectedApp.put('/thresholds', AudioController.updateTimerThresholds);
  });
}
