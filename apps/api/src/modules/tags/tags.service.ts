import { prisma } from '../../config/database.js';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../shared/errors.js';
import type { CreateTagBody, UpdateTagBody } from './tags.schema.js';

export async function getTags(userId: string) {
  return prisma.tag.findMany({ where: { userId }, orderBy: { name: 'asc' } });
}

export async function createTag(userId: string, data: CreateTagBody) {
  const existingCount = await prisma.tag.count({ where: { userId } });
  if (existingCount >= 20) {
    throw new ValidationError('Has alcanzado el límite máximo de 20 etiquetas.');
  }

  const existing = await prisma.tag.findUnique({
    where: { userId_name: { userId, name: data.name } },
  });
  if (existing) throw new ConflictError('Ya tienes un tag con ese nombre');
  return prisma.tag.create({ data: { userId, ...data } });
}

export async function updateTag(userId: string, tagId: string, data: UpdateTagBody) {
  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) throw new NotFoundError('Tag no encontrado');
  if (tag.userId !== userId) throw new ForbiddenError();
  return prisma.tag.update({ where: { id: tagId }, data });
}

export async function deleteTag(userId: string, tagId: string): Promise<void> {
  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) throw new NotFoundError('Tag no encontrado');
  if (tag.userId !== userId) throw new ForbiddenError();
  await prisma.tag.delete({ where: { id: tagId } });
}
