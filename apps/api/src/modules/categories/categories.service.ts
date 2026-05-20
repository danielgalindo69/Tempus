import { prisma } from '../../config/database.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors.js';
import type { CreateUserCategoryBody, UpdateUserCategoryBody } from './categories.schema.js';

export async function getSystemCategories() {
  return prisma.systemCategory.findMany({
    where:   { isActive: true },
    orderBy: { name: 'asc' },
  });
}

export async function getUserCategories(userId: string) {
  return prisma.userCategory.findMany({
    where:   { userId },
    orderBy: { name: 'asc' },
  });
}

export async function createUserCategory(userId: string, data: CreateUserCategoryBody) {
  const existing = await prisma.userCategory.findUnique({
    where: { userId_name: { userId, name: data.name } },
  });
  if (existing) throw new ConflictError('Ya tienes una categoría con ese nombre');

  return prisma.userCategory.create({
    data: { userId, ...data },
  });
}

export async function updateUserCategory(
  userId: string,
  categoryId: string,
  data: UpdateUserCategoryBody,
) {
  const cat = await prisma.userCategory.findUnique({ where: { id: categoryId } });
  if (!cat) throw new NotFoundError('Categoría no encontrada');
  if (cat.userId !== userId) throw new ForbiddenError();

  if (data.name && data.name !== cat.name) {
    const dup = await prisma.userCategory.findUnique({
      where: { userId_name: { userId, name: data.name } },
    });
    if (dup) throw new ConflictError('Ya tienes una categoría con ese nombre');
  }

  return prisma.userCategory.update({ where: { id: categoryId }, data });
}

export async function deleteUserCategory(userId: string, categoryId: string): Promise<void> {
  const cat = await prisma.userCategory.findUnique({ where: { id: categoryId } });
  if (!cat) throw new NotFoundError('Categoría no encontrada');
  if (cat.userId !== userId) throw new ForbiddenError();
  await prisma.userCategory.delete({ where: { id: categoryId } });
}
