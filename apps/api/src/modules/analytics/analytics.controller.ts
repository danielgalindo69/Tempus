import { FastifyRequest, FastifyReply } from 'fastify';
import * as AnalyticsService from './analytics.service.js';
import { DateRangeSchema } from './analytics.schema.js';

export async function getSummary(request: FastifyRequest, reply: FastifyReply) {
  const query = DateRangeSchema.parse(request.query);
  const summary = await AnalyticsService.getSummary(request.user.id, query.from, query.to);
  reply.send(summary);
}

export async function getCategoryDistribution(request: FastifyRequest, reply: FastifyReply) {
  const query = DateRangeSchema.parse(request.query);
  const distribution = await AnalyticsService.getCategoryDistribution(request.user.id, query.from, query.to);
  reply.send(distribution);
}

export async function getStreakInfo(request: FastifyRequest, reply: FastifyReply) {
  const streak = await AnalyticsService.getStreakInfo(request.user.id);
  reply.send({ streak });
}
