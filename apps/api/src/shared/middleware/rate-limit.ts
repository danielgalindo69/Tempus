import fastifyRateLimit from '@fastify/rate-limit';
import { FastifyInstance } from 'fastify';
import { isUsingMemoryCache } from '../../config/redis.js';

export async function registerRateLimit(app: FastifyInstance): Promise<void> {
  // Si usamos cache en memoria (sin Redis real), no pasamos el cliente redis
  // @fastify/rate-limit usa memoria interna por defecto
  const baseConfig = {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    keyGenerator(request: Parameters<typeof app.register>[0] extends (app: FastifyInstance) => void ? never : import('fastify').FastifyRequest) {
      const userId = (request as { user?: { id: string } }).user?.id;
      return userId ?? request.ip;
    },
    errorResponseBuilder(_request: unknown, context: { after: string }) {
      return {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Demasiadas solicitudes. Intenta de nuevo en ${context.after}`,
        },
      };
    },
  };

  if (!isUsingMemoryCache) {
    // Redis real disponible — importar y pasar el cliente
    try {
      const { default: Redis } = await import('ioredis');
      const { getEnv } = await import('../../config/env.js');
      const { REDIS_URL } = getEnv();
      const redisClient = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 1,
        lazyConnect: false,
        connectTimeout: 2000,
      });
      await app.register(fastifyRateLimit, { ...baseConfig, redis: redisClient });
      return;
    } catch {
      // fall through to memory rate limit
    }
  }

  await app.register(fastifyRateLimit, baseConfig);
}
