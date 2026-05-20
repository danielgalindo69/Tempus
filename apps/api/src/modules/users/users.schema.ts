import { z } from 'zod';
import { UpdateUserSchema } from '@tempus/shared-types';

export { UpdateUserSchema };
export type UpdateUserBody = z.infer<typeof UpdateUserSchema>;
