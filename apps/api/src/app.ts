/// <reference path="./shared/types/fastify.d.ts" />
import { FastifyInstance } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';

import { getEnv } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { registerRateLimit } from './shared/middleware/rate-limit.js';
import { registerErrorHandler } from './shared/middleware/error-handler.js';

// Módulos
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { categoriesRoutes } from './modules/categories/categories.routes.js';
import { tagsRoutes } from './modules/tags/tags.routes.js';
import { weekPlansRoutes } from './modules/week-plans/week-plans.routes.js';
import { tasksRoutes } from './modules/tasks/tasks.routes.js';
import { timeSessionsRoutes } from './modules/time-sessions/time-sessions.routes.js';
import { notificationsRoutes } from './modules/notifications/notifications.routes.js';
import { analyticsRoutes } from './modules/analytics/analytics.routes.js';
import { habitsRoutes } from './modules/habits/habits.routes.js';
import { audioRoutes } from './modules/audio/audio.routes.js';

// Jobs
import { startScheduler } from './jobs/scheduler.js';

export async function buildApp(app: FastifyInstance): Promise<FastifyInstance> {
  const env = getEnv();

  // ── Plugins de seguridad ─────────────────────────────────────
  await app.register(fastifyHelmet, { contentSecurityPolicy: false });
  
  const origins = env.CORS_ORIGIN.includes(',') 
    ? env.CORS_ORIGIN.split(',') 
    : env.CORS_ORIGIN;

  await app.register(fastifyCors, {
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  await app.register(fastifyCookie, {
    secret: env.JWT_REFRESH_SECRET,
    parseOptions: {},
  });

  // ── Rate limiting ────────────────────────────────────────────
  await registerRateLimit(app);

  // ── Error handler global ─────────────────────────────────────
  registerErrorHandler(app);

  // ── Health check ─────────────────────────────────────────────
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // ── Rutas de la API ──────────────────────────────────────────
  const API_PREFIX = '/api';

  await app.register(authRoutes,          { prefix: `${API_PREFIX}/auth` });
  await app.register(usersRoutes,         { prefix: `${API_PREFIX}/users` });
  await app.register(categoriesRoutes,    { prefix: `${API_PREFIX}/categories` });
  await app.register(tagsRoutes,          { prefix: `${API_PREFIX}/tags` });
  await app.register(weekPlansRoutes,     { prefix: `${API_PREFIX}/week-plans` });
  await app.register(tasksRoutes,         { prefix: `${API_PREFIX}/tasks` });
  await app.register(timeSessionsRoutes,  { prefix: `${API_PREFIX}/sessions` });
  await app.register(notificationsRoutes, { prefix: `${API_PREFIX}/notifications` });
  await app.register(analyticsRoutes,     { prefix: `${API_PREFIX}/analytics` });
  await app.register(habitsRoutes,        { prefix: `${API_PREFIX}/habits` });
  await app.register(audioRoutes,         { prefix: `${API_PREFIX}/audio` });

  // ── Conexiones externas ──────────────────────────────────────
  app.addHook('onReady', async () => {
    await connectDatabase();
    await connectRedis();
    if (env.NODE_ENV !== 'test') {
      startScheduler();
    }
  });

  app.addHook('onClose', async () => {
    const { disconnectDatabase } = await import('./config/database.js');
    const { disconnectRedis } = await import('./config/redis.js');
    await disconnectDatabase();
    await disconnectRedis();
  });

  return app;
}
