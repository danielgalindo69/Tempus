import fastifyRateLimit from '@fastify/rate-limit';
import { FastifyInstance } from 'fastify';

export async function registerRateLimit(app: FastifyInstance): Promise<void> {
  // Usamos rate limit en memoria — suficiente para desarrollo
  // En producción, pasar un cliente Redis real aquí
  await app.register(fastifyRateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    keyGenerator(request) {
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
