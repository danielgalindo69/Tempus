import { FastifyRequest, FastifyReply } from 'fastify';
import * as AuthService from './auth.service.js';
import { RegisterSchema, LoginSchema } from './auth.schema.js';
import { getEnv } from '../../config/env.js';

const COOKIE_NAME   = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60, // 7 días en segundos
};

export async function register(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = RegisterSchema.parse(request.body);
  const { accessToken, refreshToken } = await AuthService.registerUser(body);
  const user = await AuthService.getUserById(
    // extraemos el userId del token ya generado
    (await import('../../shared/utils/jwt.js')).verifyAccessToken(accessToken).sub,
  );

  const { NODE_ENV } = getEnv();
  reply.setCookie(COOKIE_NAME, refreshToken, {
    ...COOKIE_OPTIONS,
  });

  reply.status(201).send({ user, accessToken });
}

export async function login(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = LoginSchema.parse(request.body);
  const { accessToken, refreshToken } = await AuthService.loginUser(body, request.ip);
  const user = await AuthService.getUserById(
    (await import('../../shared/utils/jwt.js')).verifyAccessToken(accessToken).sub,
  );

  const { NODE_ENV } = getEnv();
  reply.setCookie(COOKIE_NAME, refreshToken, {
    ...COOKIE_OPTIONS,
  });

  reply.send({ user, accessToken });
}

export async function refresh(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const token = request.cookies[COOKIE_NAME];
  if (!token) {
    reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Refresh token no encontrado' } });
    return;
  }

  const { accessToken, refreshToken } = await AuthService.refreshTokens(token);

  const { NODE_ENV } = getEnv();
  reply.setCookie(COOKIE_NAME, refreshToken, {
    ...COOKIE_OPTIONS,
  });

  reply.send({ accessToken });
}

export async function logout(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const token = request.cookies[COOKIE_NAME] ?? '';
  await AuthService.logoutUser(token);
  reply.clearCookie(COOKIE_NAME, { path: '/api/auth' });
  reply.send({ message: 'Sesión cerrada correctamente' });
}
