export type BackendTaskStatus = 'planned' | 'in_progress' | 'done';
export type BackendTaskPriority = 'low' | 'medium' | 'high';

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  timezone: string;
  avatarUrl: string | null;
  emailVerified: boolean;
}

export interface AuthResponse {
  user: BackendUser;
  accessToken: string;
}

export interface BackendTag {
  id: string;
  name: string;
  colorHex: string;
}

export interface BackendTaskRecurrence {
  id: string;
  sourceTaskId: string;
  repeatDays: string;
  recurrenceStart: string;
  recurrenceEnd: string | null;
  isActive: boolean;
}

export interface BackendTask {
  id: string;
  title: string;
  description: string | null;
  notes?: string | null;
  estimatedSeconds?: number | null;
  status: BackendTaskStatus;
  priority?: BackendTaskPriority;
  estimatedMinutes: number | null;
  scheduledDate: string;
  colorHex: string;
  tags?: BackendTag[];
  recurrence?: BackendTaskRecurrence | null;
}

export interface BackendTimeSession {
  id: string;
  taskId: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  note: string | null;
  task?: BackendTask;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  notes?: string;
  estimatedSeconds?: number;
  status?: BackendTaskStatus;
  priority?: BackendTaskPriority;
  estimatedMinutes?: number;
  scheduledDate: string;
  tagIds?: string[];
  recurrence?: {
    repeatDays: string;
    recurrenceStart: string;
    recurrenceEnd?: string | null;
  } | null;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {}
