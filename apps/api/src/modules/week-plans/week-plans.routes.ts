import { FastifyInstance } from 'fastify';
import { authenticate } from '../../shared/middleware/authenticate.js';
import * as WeekPlansController from './week-plans.controller.js';

export async function weekPlansRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', authenticate);
  app.get('/',     WeekPlansController.getCurrentWeekPlan);
  app.get('/:id',  WeekPlansController.getWeekPlanById);
  app.post('/',    WeekPlansController.createWeekPlan);
}
