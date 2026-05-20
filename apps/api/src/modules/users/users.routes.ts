import { FastifyInstance } from 'fastify';
import { authenticate } from '../../shared/middleware/authenticate.js';
import * as UsersController from './users.controller.js';

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', authenticate);

  app.get('/me',    UsersController.getMe);
  app.patch('/me',  UsersController.updateMe);
  app.delete('/me', UsersController.deleteMe);
}
