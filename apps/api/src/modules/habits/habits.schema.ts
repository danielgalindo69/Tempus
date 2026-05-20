import { z } from 'zod';
import { UpdateHabitSettingsSchema, DateRangeSchema } from '@tempus/shared-types';

export { UpdateHabitSettingsSchema, DateRangeSchema };

export type UpdateHabitSettingsBody = z.infer<typeof UpdateHabitSettingsSchema>;
export type HabitHistoryQuery = z.infer<typeof DateRangeSchema>;
