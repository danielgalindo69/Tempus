import { vi } from 'vitest';

// Configurar variables de entorno por defecto para entorno de tests
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/tempus_test?schema=public';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test_access_secret_key_extremely_long_and_secure';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_extremely_long_and_secure';
process.env.ACCESS_TOKEN_EXPIRY = '15m';
process.env.REFRESH_TOKEN_EXPIRY = '7d';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.VAPID_PUBLIC_KEY = 'test_public_key';
process.env.VAPID_PRIVATE_KEY = 'test_private_key';
process.env.VAPID_SUBJECT = 'mailto:test@tempus.com';

// ── Mock de Redis (ioredis) para independizar las pruebas de un servidor en ejecución ──
vi.mock('ioredis', () => {
  return {
    default: class RedisMock {
      get = vi.fn().mockResolvedValue(null);
      set = vi.fn().mockResolvedValue('OK');
      setex = vi.fn().mockResolvedValue('OK');
      del = vi.fn().mockResolvedValue(1);
      incr = vi.fn().mockResolvedValue(1);
      expire = vi.fn().mockResolvedValue(1);
      ttl = vi.fn().mockResolvedValue(60);
      defineCommand = vi.fn(function (this: any, name: string) {
        this[name] = vi.fn(function (...args: any[]) {
          const callback = args[args.length - 1];
          const result = [1, 60000];
          if (typeof callback === 'function') {
            callback(null, result);
          }
          return Promise.resolve(result);
        });
      });
      connect = vi.fn().mockResolvedValue(undefined);
      on = vi.fn((event, callback) => {
        if (event === 'connect') {
          setTimeout(callback, 0);
        }
        return this;
      });
      quit = vi.fn().mockResolvedValue('OK');
    }
  };
});

// ── Mock de Web Push para no realizar conexiones de red reales ──
vi.mock('web-push', () => {
  return {
    default: {
      setVapidDetails: vi.fn(),
      sendNotification: vi.fn().mockResolvedValue({ statusCode: 201 })
    }
  };
});

// Mockear el logger de Fastify para no ensuciar la consola de los tests
vi.mock('pino', () => {
  return {
    default: () => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      child: () => ({
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
      })
    })
  };
});
