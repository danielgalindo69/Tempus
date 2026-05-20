import { FastifyRequest, FastifyReply } from 'fastify';
import * as TimeSessionsService from './time-sessions.service.js';
import { StartSessionSchema, StopSessionSchema, SessionQuerySchema } from './time-sessions.schema.js';

export async function getActiveSession(request: FastifyRequest, reply: FastifyReply) {
  const session = await TimeSessionsService.getActiveSession(request.user.id);
  reply.send({ session });
}

export async function getSessions(request: FastifyRequest, reply: FastifyReply) {
  const query = SessionQuerySchema.parse(request.query);
  const sessions = await TimeSessionsService.getSessions(request.user.id, query);
  reply.send({ sessions });
}

export async function startSession(request: FastifyRequest, reply: FastifyReply) {
  const body = StartSessionSchema.parse(request.body);
  const session = await TimeSessionsService.startSession(request.user.id, body);
  reply.status(201).send({ session });
}

export async function stopSession(request: FastifyRequest, reply: FastifyReply) {
  const body = StopSessionSchema.parse(request.body);
  const session = await TimeSessionsService.stopSession(request.user.id, body);
  reply.send({ session });
}

export async function deleteSession(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  await TimeSessionsService.deleteSession(request.user.id, id);
  reply.status(204).send();
}
