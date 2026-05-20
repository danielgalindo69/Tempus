import {
  FastifyRequest,
  FastifyReply,
  FastifyError,
  FastifyInstance,
} from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../errors.js';
import { getEnv } from '../../config/env.js';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (
      error: FastifyError | AppError | ZodError | Error,
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      const { NODE_ENV } = getEnv();
      const isProd = NODE_ENV === 'production';

      // ── 1. Errores de validación de Zod ──────────────────────
      if (error instanceof ZodError) {
        const response: ErrorResponse = {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Los datos enviados no son válidos',
            details: error.flatten().fieldErrors,
          },
        };
        return reply.status(422).send(response);
      }

      // ── 2. Errores de aplicación propios ─────────────────────
      if (error instanceof AppError) {
        if (error.statusCode >= 500) {
          request.log.error({ err: error }, error.message);
        }
        const response: ErrorResponse = {
          error: {
            code: error.code,
            message: error.message,
            details: isProd ? undefined : error.details,
          },
        };
        return reply.status(error.statusCode).send(response);
      }

      // ── 3. Errores de Fastify (validation, not found, etc.) ──
      if ('statusCode' in error && typeof error.statusCode === 'number') {
        const fastifyErr = error as FastifyError;
        // Fastify validation errors (schema JSON)
        if (fastifyErr.validation) {
          return reply.status(422).send({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Los datos enviados no son válidos',
              details: fastifyErr.validation,
            },
          });
        }
        return reply.status(fastifyErr.statusCode ?? 500).send({
          error: {
            code: 'REQUEST_ERROR',
            message: fastifyErr.message,
          },
        });
      }

      // ── 4. Errores no controlados ─────────────────────────────
      request.log.error({ err: error }, 'Error no controlado');
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: isProd
            ? 'Ha ocurrido un error interno. Intenta más tarde.'
            : error.message,
          details: isProd ? undefined : error.stack,
        },
      });
    },
  );
}
