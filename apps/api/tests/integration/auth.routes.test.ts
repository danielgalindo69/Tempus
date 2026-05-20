import { describe, it, expect, vi, beforeEach } from 'vitest';
import fastify from 'fastify';
import jwt from 'jsonwebtoken';
import { buildApp } from '../../src/app.js';
import { prisma } from '../../src/config/database.js';
import * as AuthService from '../../src/modules/auth/auth.service.js';

// Mockear el servicio completo para aislar la capa de rutas
vi.mock('../../src/modules/auth/auth.service.js');

// Mockear base de datos
vi.mock('../../src/config/database.js', () => ({
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn(),
  prisma: {},
}));

describe('Auth Routes - Integration Tests', () => {
  let app: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = fastify();
    await buildApp(app);
  });

  describe('POST /api/auth/register', () => {
    it('debería retornar 422 si faltan campos obligatorios', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'invalid-email',
        },
      });

      expect(response.statusCode).toBe(422);
    });

    it('debería registrar exitosamente y retornar 210 o 201', async () => {
      const realToken = jwt.sign(
        { id: 'user-1', email: 'integration@test.com' },
        'test_access_secret_key_extremely_long_and_secure'
      );

      const mockTokens = {
        accessToken: realToken,
        refreshToken: 'refresh_token_123',
      };

      const mockUser = {
        id: 'user-1',
        name: 'Integration Test',
        email: 'integration@test.com',
        timezone: 'America/Bogota',
        avatarUrl: null,
        emailVerified: false,
      };

      vi.mocked(AuthService.registerUser).mockResolvedValue(mockTokens);
      vi.mocked(AuthService.getUserById).mockResolvedValue(mockUser);

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          name: 'Integration Test',
          email: 'integration@test.com',
          password: 'securePassword123',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.user.email).toBe('integration@test.com');
      expect(body.accessToken).toBe(realToken);
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería iniciar sesión correctamente y retornar 200', async () => {
      const realToken = jwt.sign(
        { id: 'user-1', email: 'integration@test.com' },
        'test_access_secret_key_extremely_long_and_secure'
      );

      const mockTokens = {
        accessToken: realToken,
        refreshToken: 'refresh_token_123',
      };

      const mockUser = {
        id: 'user-1',
        name: 'Integration Test',
        email: 'integration@test.com',
        timezone: 'America/Bogota',
        avatarUrl: null,
        emailVerified: true,
      };

      vi.mocked(AuthService.loginUser).mockResolvedValue(mockTokens);
      vi.mocked(AuthService.getUserById).mockResolvedValue(mockUser);

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'integration@test.com',
          password: 'correctPassword',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.accessToken).toBe(realToken);
    });
  });
});
