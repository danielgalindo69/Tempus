import { FastifyRequest, FastifyReply } from 'fastify';
import * as AudioService from './audio.service.js';
import { UpdateAudioSettingsSchema, UpdateTimerThresholdsSchema } from './audio.schema.js';

export async function getSettings(request: FastifyRequest, reply: FastifyReply) {
  const settings = await AudioService.getSettings(request.user.id);
  reply.send(settings);
}

export async function updateSettings(request: FastifyRequest, reply: FastifyReply) {
  const body = UpdateAudioSettingsSchema.parse(request.body);
  const settings = await AudioService.updateSettings(request.user.id, body);
  reply.send({ settings });
}

export async function updateTimerThresholds(request: FastifyRequest, reply: FastifyReply) {
  const body = UpdateTimerThresholdsSchema.parse(request.body);
  const thresholds = await AudioService.updateTimerThresholds(request.user.id, body);
  reply.send({ thresholds });
}
