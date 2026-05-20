import { FastifyRequest, FastifyReply } from 'fastify';
import * as UsersService from './users.service.js';
import { UpdateUserSchema } from './users.schema.js';

export async function getMe(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = await UsersService.getMe(request.user.id);
  reply.send({ user });
}

export async function updateMe(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = UpdateUserSchema.parse(request.body);
  const user = await UsersService.updateMe(request.user.id, body);
  reply.send({ user });
}

export async function deleteMe(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await UsersService.deleteMe(request.user.id);
  reply.status(204).send();
}
