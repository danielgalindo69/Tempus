import { FastifyRequest, FastifyReply } from 'fastify';
import * as TasksService from './tasks.service.js';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  UpdateTaskStatusSchema,
  UpdateTaskPositionSchema,
  TaskQuerySchema,
  CreateAttachmentSchema
} from './tasks.schema.js';

export async function getTasks(request: FastifyRequest, reply: FastifyReply) {
  const query = TaskQuerySchema.parse(request.query);
  const tasks = await TasksService.getTasks(request.user.id, query);
  reply.send({ tasks });
}

export async function getTaskById(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const task = await TasksService.getTaskById(request.user.id, id);
  reply.send({ task });
}

export async function createTask(request: FastifyRequest, reply: FastifyReply) {
  const body = CreateTaskSchema.parse(request.body);
  const task = await TasksService.createTask(request.user.id, body);
  reply.status(201).send({ task });
}

export async function updateTask(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const body = UpdateTaskSchema.parse(request.body);
  const task = await TasksService.updateTask(request.user.id, id, body);
  reply.send({ task });
}

export async function updateTaskStatus(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const { status } = UpdateTaskStatusSchema.parse(request.body);
  const task = await TasksService.updateTaskStatus(request.user.id, id, status);
  reply.send({ task });
}

export async function updateTaskPosition(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const { position } = UpdateTaskPositionSchema.parse(request.body);
  const task = await TasksService.updateTaskPosition(request.user.id, id, position);
  reply.send({ task });
}

export async function deleteTask(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  await TasksService.deleteTask(request.user.id, id);
  reply.status(204).send();
}

// ─────────────────────────────────────────────
// ATTACHMENTS CONTROLLERS
// ─────────────────────────────────────────────

export async function addAttachment(request: FastifyRequest, reply: FastifyReply) {
  const { id: taskId } = request.params as { id: string };
  const body = CreateAttachmentSchema.parse(request.body);
  const attachment = await TasksService.addAttachment(request.user.id, taskId, body);
  reply.status(201).send({ attachment });
}

export async function deleteAttachment(request: FastifyRequest, reply: FastifyReply) {
  const { attachmentId } = request.params as { attachmentId: string };
  await TasksService.deleteAttachment(request.user.id, attachmentId);
  reply.status(204).send();
}
