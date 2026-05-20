import { FastifyInstance } from 'fastify';
import { authenticate } from '../../shared/middleware/authenticate.js';
import * as AnalyticsController from './analytics.controller.js';

export async function analyticsRoutes(app: FastifyInstance): Promise<void> {
  app.register(async (protectedApp) => {
    protectedApp.addHook('onRequest', authenticate);

    protectedApp.get('/summary', AnalyticsController.getSummary);
    protectedApp.get('/categories', AnalyticsController.getCategoryDistribution);
    protectedApp.get('/streak', AnalyticsController.getStreakInfo);
  });
}
