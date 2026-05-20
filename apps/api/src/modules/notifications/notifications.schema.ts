import { z } from 'zod';
import {
  NotificationQuerySchema,
  PushSubscribeSchema,
  PushUnsubscribeSchema
} from '@tempus/shared-types';

export {
  NotificationQuerySchema,
  PushSubscribeSchema,
  PushUnsubscribeSchema
};

export type NotificationQueryQuery = z.infer<typeof NotificationQuerySchema>;
export type PushSubscribeBody = z.infer<typeof PushSubscribeSchema>;
export type PushUnsubscribeBody = z.infer<typeof PushUnsubscribeSchema>;

export const MarkNotificationsReadSchema = z.object({
  notificationIds: z.array(z.string().cuid()).optional()
});
export type MarkNotificationsReadBody = z.infer<typeof MarkNotificationsReadSchema>;
