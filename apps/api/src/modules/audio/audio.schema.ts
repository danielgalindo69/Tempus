import { z } from 'zod';
import { UpdateAudioSettingsSchema, UpdateTimerThresholdsSchema } from '@tempus/shared-types';

export { UpdateAudioSettingsSchema, UpdateTimerThresholdsSchema };

export type UpdateAudioSettingsBody = z.infer<typeof UpdateAudioSettingsSchema>;
export type UpdateTimerThresholdsBody = z.infer<typeof UpdateTimerThresholdsSchema>;
