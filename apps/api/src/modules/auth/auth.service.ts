import { prisma } from '../../config/database.js';
import { redis } from '../../config/redis.js';
import { hashPassword, comparePassword } from '../../shared/utils/hash.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getTokenTtlSeconds,
} from '../../shared/utils/jwt.js';
import { getWeekStart, getWeekEnd } from '../../shared/utils/date.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../shared/errors.js';
import type { RegisterBody, LoginBody } from './auth.schema.js';
import { randomUUID } from 'crypto';

const LOGIN_ATTEMPTS_PREFIX = 'login:attempts:';
const REFRESH_TOKEN_PREFIX  = 'refresh:';
const MAX_LOGIN_ATTEMPTS    = 5;
const LOCKOUT_SECONDS       = 30;

// ─── Timer Color Thresholds por defecto ──────────────────────
const DEFAULT_THRESHOLDS = [
  { threshold: 60,  colorHex: '#3A7D5C', pulse: false, sortOrder: 1 },
  { threshold: 80,  colorHex: '#C4914A', pulse: false, sortOrder: 2 },
  { threshold: 95,  colorHex: '#A8263D', pulse: false, sortOrder: 3 },
  { threshold: 100, colorHex: '#8B1A2F', pulse: true,  sortOrder: 4 },
];

export async function registerUser(data: RegisterBody) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ConflictError('Ya existe una cuenta con ese correo electrónico');
  }

  const passwordHash = await hashPassword(data.password);
  const now          = new Date();
  const weekStart    = getWeekStart(now, 'America/Bogota');
  const weekEnd      = getWeekEnd(now, 'America/Bogota');

  const user = await prisma.$transaction(async (tx) => {
    // 1. Crear usuario
    const newUser = await tx.user.create({
      data: {
        name:         data.name,
        email:        data.email,
        passwordHash,
      },
    });

    // 2. HabitSettings por defecto
    await tx.habitSettings.create({ data: { userId: newUser.id } });

    // 3. Streak inicial
    await tx.streak.create({ data: { userId: newUser.id } });

    // 4. AudioSettings por defecto
    await tx.audioSettings.create({ data: { userId: newUser.id } });

    // 5. TimerColorThresholds por defecto
    await tx.timerColorThreshold.createMany({
      data: DEFAULT_THRESHOLDS.map((t) => ({ ...t, userId: newUser.id })),
    });

    // 6. WeekPlan de la semana actual
    await tx.weekPlan.create({
      data: {
        userId:    newUser.id,
        weekStart,
        weekEnd,
      },
    });

    return newUser;
  });

  return generateTokens(user.id, user.email);
}

export async function loginUser(data: LoginBody, ip: string) {
  const attemptsKey = `${LOGIN_ATTEMPTS_PREFIX}${ip}`;
  const attempts    = await redis.get(attemptsKey);

  if (attempts && parseInt(attempts, 10) >= MAX_LOGIN_ATTEMPTS) {
    const ttl = await redis.ttl(attemptsKey);
    throw new ValidationError(
      `Demasiados intentos fallidos. Intenta de nuevo en ${ttl}s`,
    );
  }

  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    await incrementLoginAttempts(attemptsKey);
    throw new UnauthorizedError('Credenciales incorrectas', 'UNAUTHORIZED');
  }

  const valid = await comparePassword(data.password, user.passwordHash);
  if (!valid) {
    await incrementLoginAttempts(attemptsKey);
    throw new UnauthorizedError('Credenciales incorrectas', 'UNAUTHORIZED');
  }

  // Login exitoso → resetear contador
  await redis.del(attemptsKey);
  return generateTokens(user.id, user.email);
}

export async function refreshTokens(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);

  // Verificar que el token esté en la allow-list de Redis
  const stored = await redis.get(`${REFRESH_TOKEN_PREFIX}${payload.jti}`);
  if (!stored || stored !== payload.sub) {
    throw new UnauthorizedError('Refresh token revocado o inválido', 'INVALID_TOKEN');
  }

  const user = await prisma.user.findUnique({
    where:  { id: payload.sub },
    select: { id: true, email: true },
  });
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  // Revocar el token viejo
  await redis.del(`${REFRESH_TOKEN_PREFIX}${payload.jti}`);

  return generateTokens(user.id, user.email);
}

export async function logoutUser(refreshToken: string): Promise<void> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    await redis.del(`${REFRESH_TOKEN_PREFIX}${payload.jti}`);
  } catch {
    // Si el token ya expiró o es inválido, simplemente ignoramos
  }
}

// ─── Helpers privados ─────────────────────────────────────────

async function generateTokens(userId: string, email: string) {
  const jti          = randomUUID();
  const accessToken  = signAccessToken(userId, email);
  const refreshToken = signRefreshToken(userId, jti);
  const ttl          = getTokenTtlSeconds(refreshToken);

  // Guardar refresh token en Redis con TTL
  await redis.set(`${REFRESH_TOKEN_PREFIX}${jti}`, userId, 'EX', ttl);

  return { accessToken, refreshToken };
}

async function incrementLoginAttempts(key: string): Promise<void> {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, LOCKOUT_SECONDS);
  }
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { id: true, name: true, email: true, timezone: true, avatarUrl: true, emailVerified: true },
  });
  if (!user) throw new NotFoundError('Usuario no encontrado');
  return user;
}
