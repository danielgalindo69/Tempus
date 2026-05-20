import { z } from 'zod';
import { RegisterSchema, LoginSchema } from '@tempus/shared-types';

export { RegisterSchema, LoginSchema };

export const RefreshTokenSchema = z.object({});  // body vacío, lee de cookie
export const LogoutSchema = z.object({});

export type RegisterBody = z.infer<typeof RegisterSchema>;
export type LoginBody    = z.infer<typeof LoginSchema>;
