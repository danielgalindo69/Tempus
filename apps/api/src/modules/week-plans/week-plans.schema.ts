import { z } from 'zod';
import { CreateWeekPlanSchema } from '@tempus/shared-types';
export { CreateWeekPlanSchema };
export type CreateWeekPlanBody = z.infer<typeof CreateWeekPlanSchema>;
