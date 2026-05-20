import { z } from 'zod';
import { CreateUserCategorySchema, UpdateUserCategorySchema } from '@tempus/shared-types';
export { CreateUserCategorySchema, UpdateUserCategorySchema };
export type CreateUserCategoryBody = z.infer<typeof CreateUserCategorySchema>;
export type UpdateUserCategoryBody = z.infer<typeof UpdateUserCategorySchema>;
