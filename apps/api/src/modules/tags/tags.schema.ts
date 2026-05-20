import { z } from 'zod';
import { CreateTagSchema, UpdateTagSchema } from '@tempus/shared-types';
export { CreateTagSchema, UpdateTagSchema };
export type CreateTagBody = z.infer<typeof CreateTagSchema>;
export type UpdateTagBody = z.infer<typeof UpdateTagSchema>;
