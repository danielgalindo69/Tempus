export type BackendTaskStatus = 'planned' | 'in_progress' | 'done';

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

export interface BackendTask {
  id: string;
  title: string;
  description: string | null;
  status: BackendTaskStatus;
  estimatedMinutes: number | null;
  scheduledDate: string;
  colorHex: string;
  tags?: BackendTag[];
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
  status?: BackendTaskStatus;
  estimatedMinutes?: number;
  scheduledDate: string;
  tagIds?: string[];
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {}
