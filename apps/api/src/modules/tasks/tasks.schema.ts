import { z } from 'zod';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  UpdateTaskStatusSchema,
  UpdateTaskPositionSchema,
  TaskQuerySchema,
  CreateAttachmentSchema
} from '@tempus/shared-types';

export {
  CreateTaskSchema,
  UpdateTaskSchema,
  UpdateTaskStatusSchema,
  UpdateTaskPositionSchema,
  TaskQuerySchema,
  CreateAttachmentSchema
};

export type CreateTaskBody = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskBody = z.infer<typeof UpdateTaskSchema>;
export type UpdateTaskStatusBody = z.infer<typeof UpdateTaskStatusSchema>;
export type UpdateTaskPositionBody = z.infer<typeof UpdateTaskPositionSchema>;
export type TaskQueryQuery = z.infer<typeof TaskQuerySchema>;
export type CreateAttachmentBody = z.infer<typeof CreateAttachmentSchema>;
