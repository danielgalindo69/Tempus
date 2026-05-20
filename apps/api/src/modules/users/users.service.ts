import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../shared/errors.js';
import type { UpdateUserBody } from './users.schema.js';

const USER_SELECT = {
  id:            true,
  name:          true,
  email:         true,
  timezone:      true,
  avatarUrl:     true,
  emailVerified: true,
  createdAt:     true,
  updatedAt:     true,
} as const;

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: USER_SELECT,
  });
  if (!user) throw new NotFoundError('Usuario no encontrado');
  return user;
}

export async function updateMe(userId: string, data: UpdateUserBody) {
  const user = await prisma.user.update({
    where:  { id: userId },
    data: {
      ...(data.name      !== undefined && { name:      data.name }),
      ...(data.timezone  !== undefined && { timezone:  data.timezone }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
    },
    select: USER_SELECT,
  });
  return user;
}

export async function deleteMe(userId: string): Promise<void> {
  // CASCADE en el schema elimina todos los datos relacionados
  await prisma.user.delete({ where: { id: userId } });
}
