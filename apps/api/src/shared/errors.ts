// ─────────────────────────────────────────────────────────────
// Clases de error personalizadas para TimeFlow API
// El error-handler las captura y formatea uniformemente
// ─────────────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado', details?: unknown) {
    super('NOT_FOUND', message, 404, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message = 'No autorizado',
    public readonly errorCode: 'TOKEN_EXPIRED' | 'INVALID_TOKEN' | 'UNAUTHORIZED' = 'UNAUTHORIZED',
    details?: unknown,
  ) {
    super(errorCode, message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado', details?: unknown) {
    super('FORBIDDEN', message, 403, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual del recurso', details?: unknown) {
    super('CONFLICT', message, 409, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Error de validación', details?: unknown) {
    super('VALIDATION_ERROR', message, 422, details);
  }
}

export class InternalError extends AppError {
  constructor(message = 'Error interno del servidor', details?: unknown) {
    super('INTERNAL_ERROR', message, 500, details);
  }
}
