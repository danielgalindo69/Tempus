import { FastifyRequest, FastifyReply } from 'fastify';
import * as CategoriesService from './categories.service.js';
import { CreateUserCategorySchema, UpdateUserCategorySchema } from './categories.schema.js';

export async function getSystemCategories(_: FastifyRequest, reply: FastifyReply) {
  const categories = await CategoriesService.getSystemCategories();
  reply.send({ categories });
}

export async function getUserCategories(request: FastifyRequest, reply: FastifyReply) {
  const categories = await CategoriesService.getUserCategories(request.user.id);
  reply.send({ categories });
}

export async function createUserCategory(request: FastifyRequest, reply: FastifyReply) {
  const body     = CreateUserCategorySchema.parse(request.body);
  const category = await CategoriesService.createUserCategory(request.user.id, body);
  reply.status(201).send({ category });
}

export async function updateUserCategory(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const body   = UpdateUserCategorySchema.parse(request.body);
  const category = await CategoriesService.updateUserCategory(request.user.id, id, body);
  reply.send({ category });
}

export async function deleteUserCategory(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  await CategoriesService.deleteUserCategory(request.user.id, id);
  reply.status(204).send();
}
