import jwt from 'jsonwebtoken';
import { getEnv } from '../../config/env.js';
import { UnauthorizedError } from '../errors.js';

export interface AccessTokenPayload {
  sub: string;   // userId
  email: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
  jti: string;   // token id único para revocación
}

export function signAccessToken(userId: string, email: string): string {
  const { JWT_SECRET, ACCESS_TOKEN_EXPIRY } = getEnv();
  return jwt.sign(
    { sub: userId, email, type: 'access' } satisfies AccessTokenPayload,
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] },
  );
}

export function signRefreshToken(userId: string, jti: string): string {
  const { JWT_REFRESH_SECRET, REFRESH_TOKEN_EXPIRY } = getEnv();
  return jwt.sign(
    { sub: userId, type: 'refresh', jti } satisfies RefreshTokenPayload,
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] },
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const { JWT_SECRET } = getEnv();
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
    return payload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token de acceso expirado', 'TOKEN_EXPIRED');
    }
    throw new UnauthorizedError('Token de acceso inválido', 'INVALID_TOKEN');
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const { JWT_REFRESH_SECRET } = getEnv();
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
    return payload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token expirado', 'TOKEN_EXPIRED');
    }
    throw new UnauthorizedError('Refresh token inválido', 'INVALID_TOKEN');
  }
}

/** Calcula en segundos el TTL para Redis a partir del exp del token */
export function getTokenTtlSeconds(token: string): number {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) return 0;
  return Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
}
