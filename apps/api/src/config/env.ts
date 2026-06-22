import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  // VAPID opcionales en desarrollo
  VAPID_PUBLIC_KEY: z.string().optional().default(''),
  VAPID_PRIVATE_KEY: z.string().optional().default(''),
  VAPID_SUBJECT: z.string().default('mailto:admin@tempus.app'),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
});

let _env: z.infer<typeof envSchema>;

export function getEnv(): z.infer<typeof envSchema> {
  if (!_env) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error(
        '❌ Variables de entorno inválidas:',
        parsed.error.flatten().fieldErrors,
      );
      process.exit(1);
    }
    _env = parsed.data;
  }
  return _env;
}

export type Env = z.infer<typeof envSchema>;
