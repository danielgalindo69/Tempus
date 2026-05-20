import { FastifyRequest, FastifyReply } from 'fastify';
import * as HabitsService from './habits.service.js';
import { UpdateHabitSettingsSchema, DateRangeSchema } from './habits.schema.js';

export async function getSettings(request: FastifyRequest, reply: FastifyReply) {
  const settings = await HabitsService.getSettings(request.user.id);
  reply.send({ settings });
}

export async function updateSettings(request: FastifyRequest, reply: FastifyReply) {
  const body = UpdateHabitSettingsSchema.parse(request.body);
  const settings = await HabitsService.updateSettings(request.user.id, body);
  reply.send({ settings });
}

export async function getHistory(request: FastifyRequest, reply: FastifyReply) {
  const query = DateRangeSchema.parse(request.query);
  const history = await HabitsService.getHistory(request.user.id, query.from, query.to);
  reply.send({ history });
}
