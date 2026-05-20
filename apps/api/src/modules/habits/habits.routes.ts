import { FastifyInstance } from 'fastify';
import { authenticate } from '../../shared/middleware/authenticate.js';
import * as HabitsController from './habits.controller.js';

export async function habitsRoutes(app: FastifyInstance): Promise<void> {
  app.register(async (protectedApp) => {
    protectedApp.addHook('onRequest', authenticate);

    protectedApp.get('/settings', HabitsController.getSettings);
    protectedApp.put('/settings', HabitsController.updateSettings);
    protectedApp.get('/history', HabitsController.getHistory);
  });
}
