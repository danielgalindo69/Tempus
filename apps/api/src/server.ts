import Fastify from 'fastify';
import { getEnv } from './config/env.js';
import { buildApp } from './app.js';

async function bootstrap(): Promise<void> {
  const env = getEnv();

  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
    trustProxy: true,
  });

  await buildApp(app);

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`🚀 TimeFlow API corriendo en http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    app.log.info(`Señal ${signal} recibida, apagando...`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT',  () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

void bootstrap();
