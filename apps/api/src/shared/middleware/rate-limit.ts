import fastifyRateLimit from '@fastify/rate-limit';
import { FastifyInstance } from 'fastify';
import { redis } from '../../config/redis.js';

export async function registerRateLimit(app: FastifyInstance): Promise<void> {
  await app.register(fastifyRateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    redis,
    keyGenerator(request) {
      // Para rutas autenticadas usa el userId, sino la IP
      const userId = (request as { user?: { id: string } }).user?.id;
      return userId ?? request.ip;
    },
    errorResponseBuilder(_request, context) {
      return {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Demasiadas solicitudes. Intenta de nuevo en ${context.after}`,
        },
      };
    },
  });
}
