import Redis from 'ioredis';
import { getEnv } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

function createRedisClient(): Redis {
  const { REDIS_URL } = getEnv();
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy(times: number) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  client.on('error', (err: Error) => {
    console.error('[Redis] Error de conexión:', err.message);
  });

  client.on('connect', () => {
    console.log('[Redis] Conectado correctamente');
  });

  return client;
}

export const redis: Redis = global.__redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  global.__redis = redis;
}

export async function connectRedis(): Promise<void> {
  await redis.connect();
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
}
