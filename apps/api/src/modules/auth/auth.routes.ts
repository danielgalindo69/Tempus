import { FastifyInstance } from 'fastify';
import * as AuthController from './auth.controller.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/auth/register  — 3 req/min por IP
  app.post('/register', {
    config: { rateLimit: { max: 3, timeWindow: '1 minute' } },
  }, AuthController.register);

  // POST /api/auth/login  — 5 req/min por IP
  app.post('/login', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
  }, AuthController.login);

  // POST /api/auth/refresh
  app.post('/refresh', AuthController.refresh);

  // POST /api/auth/logout
  app.post('/logout', AuthController.logout);
}
