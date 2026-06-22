import { FastifyInstance } from 'fastify';
import { upstashClient } from './upstash-adapter.js';

export async function registerRateLimit(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', async (request, reply) => {
    // Solo aplicar a rutas que no sean /health
    if (request.url === '/health') return;

    const userId = (request as { user?: { id: string } }).user?.id;
    const ip = request.ip;
    const key = `rate-limit:${userId ?? ip}`;
    
    const windowSeconds = 60;
    const maxRequests = 100;

    try {
      // Incremento atómico en Upstash
      const current = await upstashClient.incr(key);
      
      if (current === 1) {
        await upstashClient.expire(key, windowSeconds);
      }

      if (current > maxRequests) {
        const ttl = await upstashClient.ttl(key);
        return reply.status(429).send({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Demasiadas solicitudes. Intenta de nuevo en ${ttl}s`,
          },
        });
      }
    } catch (err) {
      app.log.error(err, 'Error en Rate Limit de Upstash');
      // Fallback: permitimos la petición si el rate limit falla para no bloquear la app
    }
  });
}
