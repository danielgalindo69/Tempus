import { z } from 'zod';
import { DateRangeSchema } from '@tempus/shared-types';

export { DateRangeSchema };

export type DateRangeQuery = z.infer<typeof DateRangeSchema>;
