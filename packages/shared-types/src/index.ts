import { z } from 'zod';

// ─────────────────────────────────────────────
// Enums compartidos
// ─────────────────────────────────────────────
export const TaskStatusEnum = z.enum(['planned', 'in_progress', 'done']);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const NotificationTypeEnum = z.enum([
  'task_start',
  'task_reminder',
  'task_end',
  'system',
]);
export type NotificationType = z.infer<typeof NotificationTypeEnum>;

export const CriteriaTypeEnum = z.enum(['tasks', 'minutes', 'both']);
export type CriteriaType = z.infer<typeof CriteriaTypeEnum>;

export const TreeStageEnum = z.enum([
  'seed',
  'sprout',
  'young',
  'mature',
  'ancient',
]);
export type TreeStage = z.infer<typeof TreeStageEnum>;

export const AmbientSoundEnum = z.enum([
  'none',
  'white_noise',
  'rain',
  'lofi',
  'nature',
]);
export type AmbientSound = z.infer<typeof AmbientSoundEnum>;

export const AttachmentTypeEnum = z.enum(['link', 'image', 'pdf']);
export type AttachmentType = z.infer<typeof AttachmentTypeEnum>;

// ─────────────────────────────────────────────
// Auth schemas
// ─────────────────────────────────────────────
export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginDto = z.infer<typeof LoginSchema>;

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    timezone: z.string(),
    avatarUrl: z.string().nullable(),
    emailVerified: z.boolean(),
  }),
  accessToken: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// ─────────────────────────────────────────────
// User schemas
// ─────────────────────────────────────────────
export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  timezone: z.string().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

// ─────────────────────────────────────────────
// Category schemas
// ─────────────────────────────────────────────
export const CreateUserCategorySchema = z.object({
  name: z.string().min(1).max(60),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  icon: z.string().max(50).optional(),
});
export type CreateUserCategoryDto = z.infer<typeof CreateUserCategorySchema>;

export const UpdateUserCategorySchema = CreateUserCategorySchema.partial();
export type UpdateUserCategoryDto = z.infer<typeof UpdateUserCategorySchema>;

// ─────────────────────────────────────────────
// Tag schemas
// ─────────────────────────────────────────────
export const CreateTagSchema = z.object({
  name: z.string().min(1).max(40),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});
export type CreateTagDto = z.infer<typeof CreateTagSchema>;

export const UpdateTagSchema = CreateTagSchema.partial();
export type UpdateTagDto = z.infer<typeof UpdateTagSchema>;

// ─────────────────────────────────────────────
// Week Plan schemas
// ─────────────────────────────────────────────
export const CreateWeekPlanSchema = z.object({
  weekStart: z.string().date(),
});
export type CreateWeekPlanDto = z.infer<typeof CreateWeekPlanSchema>;

// ─────────────────────────────────────────────
// Task schemas
// ─────────────────────────────────────────────
export const TaskRecurrenceSchema = z.object({
  repeatDays: z
    .string()
    .regex(/^([0-6],?)+$/, 'repeatDays debe ser días 0-6 separados por coma'),
  recurrenceStart: z.string().date(),
  recurrenceEnd: z.string().date().optional(),
});
export type TaskRecurrenceDto = z.infer<typeof TaskRecurrenceSchema>;

export const TaskBaseObject = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default('#6366F1'),
  status: TaskStatusEnum.default('planned'),
  estimatedMinutes: z.number().int().positive().optional(),
  scheduledDate: z.string().date(),
  startTime: z.string().datetime({ offset: true }).optional(),
  endTime: z.string().datetime({ offset: true }).optional(),
  systemCategoryId: z.string().cuid().optional(),
  userCategoryId: z.string().cuid().optional(),
  notificationsEnabled: z.boolean().default(false),
  notifyMinutesBefore: z.number().int().min(0).max(1440).default(15),
  weekPlanId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).optional(),
  recurrence: TaskRecurrenceSchema.optional(),
});

export const CreateTaskSchema = TaskBaseObject.refine(
  (d) => !(d.systemCategoryId && d.userCategoryId),
  {
    message: 'Una tarea no puede tener systemCategoryId y userCategoryId simultáneamente',
    path: ['userCategoryId'],
  }
);
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = TaskBaseObject.partial().refine(
  (d) => !(d.systemCategoryId && d.userCategoryId),
  {
    message: 'Una tarea no puede tener systemCategoryId y userCategoryId simultáneamente',
    path: ['userCategoryId'],
  }
);
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;


export const UpdateTaskStatusSchema = z.object({
  status: TaskStatusEnum,
});
export type UpdateTaskStatusDto = z.infer<typeof UpdateTaskStatusSchema>;

export const UpdateTaskPositionSchema = z.object({
  position: z.number().int().min(0),
});
export type UpdateTaskPositionDto = z.infer<typeof UpdateTaskPositionSchema>;

export const TaskQuerySchema = z.object({
  date: z.string().date().optional(),
  weekPlanId: z.string().cuid().optional(),
  status: TaskStatusEnum.optional(),
  categoryId: z.string().cuid().optional(),
});
export type TaskQuery = z.infer<typeof TaskQuerySchema>;

export const CreateAttachmentSchema = z.object({
  type: AttachmentTypeEnum,
  label: z.string().max(100).optional(),
  url: z.string().url(),
});
export type CreateAttachmentDto = z.infer<typeof CreateAttachmentSchema>;

// ─────────────────────────────────────────────
// Time Session schemas
// ─────────────────────────────────────────────
export const StartSessionSchema = z.object({
  taskId: z.string().cuid(),
});
export type StartSessionDto = z.infer<typeof StartSessionSchema>;

export const StopSessionSchema = z.object({
  sessionId: z.string().cuid(),
  note: z.string().max(500).optional(),
});
export type StopSessionDto = z.infer<typeof StopSessionSchema>;

export const SessionQuerySchema = z.object({
  taskId: z.string().cuid().optional(),
});
export type SessionQuery = z.infer<typeof SessionQuerySchema>;

// ─────────────────────────────────────────────
// Notification schemas
// ─────────────────────────────────────────────
export const NotificationQuerySchema = z.object({
  unreadOnly: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});
export type NotificationQuery = z.infer<typeof NotificationQuerySchema>;

export const PushSubscribeSchema = z.object({
  endpoint: z.string().url(),
  p256dhKey: z.string().min(1),
  authKey: z.string().min(1),
  userAgent: z.string().optional(),
});
export type PushSubscribeDto = z.infer<typeof PushSubscribeSchema>;

export const PushUnsubscribeSchema = z.object({
  endpoint: z.string().url(),
});
export type PushUnsubscribeDto = z.infer<typeof PushUnsubscribeSchema>;

// ─────────────────────────────────────────────
// Analytics schemas
// ─────────────────────────────────────────────
export const DateRangeSchema = z.object({
  from: z.string().date(),
  to: z.string().date(),
});
export type DateRange = z.infer<typeof DateRangeSchema>;

// ─────────────────────────────────────────────
// Habits schemas
// ─────────────────────────────────────────────
export const UpdateHabitSettingsSchema = z.object({
  minTasksCompleted: z.number().int().min(1).optional(),
  minMinutesWorked: z.number().int().min(1).optional(),
  criteriaType: CriteriaTypeEnum.optional(),
});
export type UpdateHabitSettingsDto = z.infer<typeof UpdateHabitSettingsSchema>;

// ─────────────────────────────────────────────
// Audio schemas
// ─────────────────────────────────────────────
export const UpdateAudioSettingsSchema = z.object({
  ambientSound: AmbientSoundEnum.optional(),
  ambientVolume: z.number().int().min(0).max(100).optional(),
  timerStartSound: z.string().max(50).optional(),
  timerEndSound: z.string().max(50).optional(),
  soundsEnabled: z.boolean().optional(),
});
export type UpdateAudioSettingsDto = z.infer<typeof UpdateAudioSettingsSchema>;

export const TimerThresholdItemSchema = z.object({
  threshold: z.number().int().min(1).max(100),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  pulse: z.boolean(),
});

export const UpdateTimerThresholdsSchema = z.object({
  thresholds: z.array(TimerThresholdItemSchema).min(1).max(10),
});
export type UpdateTimerThresholdsDto = z.infer<
  typeof UpdateTimerThresholdsSchema
>;
