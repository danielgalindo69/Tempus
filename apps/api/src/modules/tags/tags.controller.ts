import { FastifyRequest, FastifyReply } from 'fastify';
import * as TagsService from './tags.service.js';
import { CreateTagSchema, UpdateTagSchema } from './tags.schema.js';

export async function getTags(request: FastifyRequest, reply: FastifyReply) {
  const tags = await TagsService.getTags(request.user.id);
  reply.send({ tags });
}

export async function createTag(request: FastifyRequest, reply: FastifyReply) {
  const body = CreateTagSchema.parse(request.body);
  const tag  = await TagsService.createTag(request.user.id, body);
  reply.status(201).send({ tag });
}

export async function updateTag(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const body   = UpdateTagSchema.parse(request.body);
  const tag    = await TagsService.updateTag(request.user.id, id, body);
  reply.send({ tag });
}

export async function deleteTag(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  await TagsService.deleteTag(request.user.id, id);
  reply.status(204).send();
}
