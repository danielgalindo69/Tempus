import { FastifyRequest, FastifyReply } from 'fastify';
import * as WeekPlansService from './week-plans.service.js';
import { CreateWeekPlanSchema } from './week-plans.schema.js';
import { prisma } from '../../config/database.js';

async function getUserTimezone(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } });
  return user?.timezone ?? 'America/Bogota';
}

export async function getCurrentWeekPlan(request: FastifyRequest, reply: FastifyReply) {
  const timezone = await getUserTimezone(request.user.id);
  const plan = await WeekPlansService.getCurrentWeekPlan(request.user.id, timezone);
  reply.send({ plan });
}

export async function getWeekPlanById(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const plan   = await WeekPlansService.getWeekPlanById(request.user.id, id);
  reply.send({ plan });
}

export async function createWeekPlan(request: FastifyRequest, reply: FastifyReply) {
  const body     = CreateWeekPlanSchema.parse(request.body);
  const timezone = await getUserTimezone(request.user.id);
  const plan     = await WeekPlansService.createWeekPlan(request.user.id, body, timezone);
  reply.status(201).send({ plan });
}
