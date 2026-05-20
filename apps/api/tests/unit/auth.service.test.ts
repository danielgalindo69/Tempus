import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as AuthService from '../../src/modules/auth/auth.service.js';
import { prisma } from '../../src/config/database.js';
import { ConflictError, UnauthorizedError } from '../../src/shared/errors.js';
import * as hashUtils from '../../src/shared/utils/hash.js';

// Mockear prisma singleton
vi.mock('../../src/config/database.js', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    timerColorThreshold: {
      createMany: vi.fn(),
    },
    audioSettings: {
      create: vi.fn(),
    },
    habitSettings: {
      create: vi.fn(),
    },
    streak: {
      create: vi.fn(),
    },
    weekPlan: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma));
  return { prisma: mockPrisma };
});

describe('AuthService - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('debería lanzar ConflictError si el email ya está registrado', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: '1',
        email: 'test@tempus.com',
      } as any);

      await expect(
        AuthService.registerUser({
          name: 'Test',
          email: 'test@tempus.com',
          password: 'securePassword123',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('debería registrar un usuario correctamente y retornar accessToken y datos', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user-id-123',
        name: 'Test User',
        email: 'test@tempus.com',
        timezone: 'America/Bogota',
        avatarUrl: null,
        emailVerified: false,
      } as any);

      const result = await AuthService.registerUser({
        name: 'Test User',
        email: 'test@tempus.com',
        password: 'securePassword123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('debería lanzar UnauthorizedError si el usuario no existe', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        AuthService.loginUser({
          email: 'notfound@tempus.com',
          password: 'password',
        }, '127.0.0.1')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('debería lanzar UnauthorizedError si la contraseña es incorrecta', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: '1',
        email: 'test@tempus.com',
        passwordHash: 'hashed_password',
      } as any);

      vi.spyOn(hashUtils, 'comparePassword').mockResolvedValue(false);

      await expect(
        AuthService.loginUser({
          email: 'test@tempus.com',
          password: 'wrongpassword',
        }, '127.0.0.1')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('debería autenticar correctamente si las credenciales son válidas', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'User Test',
        email: 'test@tempus.com',
        passwordHash: 'hashed_password',
        timezone: 'America/Bogota',
        avatarUrl: null,
        emailVerified: true,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.spyOn(hashUtils, 'comparePassword').mockResolvedValue(true);

      const result = await AuthService.loginUser({
        email: 'test@tempus.com',
        password: 'correctpassword',
      }, '127.0.0.1');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
