import { z } from 'zod';
import {
  StartSessionSchema,
  StopSessionSchema,
  SessionQuerySchema
} from '@tempus/shared-types';

export {
  StartSessionSchema,
  StopSessionSchema,
  SessionQuerySchema
};

export type StartSessionBody = z.infer<typeof StartSessionSchema>;
export type StopSessionBody = z.infer<typeof StopSessionSchema>;
export type SessionQueryQuery = z.infer<typeof SessionQuerySchema>;
