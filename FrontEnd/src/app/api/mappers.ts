import type { Task, TaskStatus, TimeSession } from '../components/timeflow/types';
import type { BackendTask, BackendTaskStatus, BackendTimeSession, CreateTaskPayload, UpdateTaskPayload } from './types';

export function toBackendStatus(status: TaskStatus): BackendTaskStatus {
  return status === 'progress' ? 'in_progress' : status;
}

export function toUiStatus(status: BackendTaskStatus): TaskStatus {
  return status === 'in_progress' ? 'progress' : status;
}

export function mapBackendSession(session: BackendTimeSession): TimeSession {
  const durationSeconds =
    session.durationSeconds ??
    (session.endedAt
      ? Math.max(0, Math.floor((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000))
      : 0);

  return {
    id: session.id,
    taskId: session.taskId,
    duration: Math.round(durationSeconds / 60),
    date: session.startedAt.split('T')[0],
    label: session.note || 'Sesion de trabajo',
  };
}

export function mapBackendTask(task: BackendTask, sessions: BackendTimeSession[] = []): Task {
  const taskSessions = sessions.filter(session => session.taskId === task.id).map(mapBackendSession);
  const actualTime = taskSessions.reduce((sum, session) => sum + session.duration, 0);

  return {
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    status: toUiStatus(task.status),
    tags:
      task.tags?.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.colorHex,
      })) ?? [],
    estimatedTime: task.estimatedMinutes ?? 60,
    actualTime,
    date: task.scheduledDate.split('T')[0],
    sessions: taskSessions,
    priority: 'medium',
  };
}

export function mapTasksWithSessions(tasks: BackendTask[], sessions: BackendTimeSession[]): Task[] {
  return tasks.map(task => mapBackendTask(task, sessions));
}

export function taskToCreatePayload(task: Task): CreateTaskPayload {
  return {
    title: task.title,
    description: task.description || undefined,
    status: toBackendStatus(task.status),
    estimatedMinutes: task.estimatedTime,
    scheduledDate: task.date,
    tagIds: task.tags.map(tag => tag.id),
  };
}

export function taskUpdatesToPayload(updates: Partial<Task>): UpdateTaskPayload {
  const payload: UpdateTaskPayload = {};

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.status !== undefined) payload.status = toBackendStatus(updates.status);
  if (updates.estimatedTime !== undefined) payload.estimatedMinutes = updates.estimatedTime;
  if (updates.date !== undefined) payload.scheduledDate = updates.date;

  return payload;
}
