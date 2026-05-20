import { prisma } from '../../config/database.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors.js';
import { getWeekEnd, parseDateString } from '../../shared/utils/date.js';
import type { CreateWeekPlanBody } from './week-plans.schema.js';

const WEEK_PLAN_INCLUDE = {
  tasks: {
    orderBy: { position: 'asc' as const },
    include: {
      taskTags:    { include: { tag: true } },
      attachments: true,
      systemCategory: true,
      userCategory:   true,
    },
  },
} as const;

export async function getCurrentWeekPlan(userId: string, timezone: string) {
  const now   = new Date();
  const start = new Date(now.setHours(0, 0, 0, 0));
  // Busca el plan cuyo rango contiene "hoy"
  const plan = await prisma.weekPlan.findFirst({
    where: {
      userId,
      weekStart: { lte: start },
      weekEnd:   { gte: start },
    },
    include: WEEK_PLAN_INCLUDE,
    orderBy: { weekStart: 'desc' },
  });
  return plan;
}

export async function getWeekPlanById(userId: string, planId: string) {
  const plan = await prisma.weekPlan.findUnique({
    where:   { id: planId },
    include: WEEK_PLAN_INCLUDE,
  });
  if (!plan) throw new NotFoundError('Plan semanal no encontrado');
  if (plan.userId !== userId) throw new ForbiddenError();
  return plan;
}

export async function createWeekPlan(userId: string, data: CreateWeekPlanBody, timezone: string) {
  const weekStart = parseDateString(data.weekStart);
  const weekEnd   = getWeekEnd(weekStart, timezone);

  const existing = await prisma.weekPlan.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
  });
  if (existing) throw new ConflictError('Ya existe un plan para esa semana');

  return prisma.weekPlan.create({
    data: { userId, weekStart, weekEnd },
    include: WEEK_PLAN_INCLUDE,
  });
}
