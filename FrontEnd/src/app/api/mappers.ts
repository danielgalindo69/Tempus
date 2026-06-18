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
    startedAt: session.startedAt,
  };
}

export function mapBackendTask(task: BackendTask, sessions: BackendTimeSession[] = []): Task {
  const taskSessions = sessions.filter(session => session.taskId === task.id).map(mapBackendSession);
  const actualTime = taskSessions.reduce((sum, session) => sum + session.duration, 0);

  return {
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    notes: task.notes ?? '',
    estimatedSeconds: task.estimatedSeconds ?? undefined,
    status: toUiStatus(task.status),
    tags:
      task.tags?.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.colorHex,
      })) ?? [],
    estimatedTime: task.estimatedSeconds ? Math.ceil(task.estimatedSeconds / 60) : (task.estimatedMinutes ?? 60),
    actualTime,
    date: task.scheduledDate.split('T')[0],
    sessions: taskSessions,
    priority: task.priority ?? 'medium',
    recurrence: task.recurrence
      ? {
          id: task.recurrence.id,
          sourceTaskId: task.recurrence.sourceTaskId,
          repeatDays: task.recurrence.repeatDays,
          recurrenceStart: task.recurrence.recurrenceStart.split('T')[0],
          recurrenceEnd: task.recurrence.recurrenceEnd ? task.recurrence.recurrenceEnd.split('T')[0] : null,
          isActive: task.recurrence.isActive,
        }
      : null,
  };
}

export function mapTasksWithSessions(tasks: BackendTask[], sessions: BackendTimeSession[]): Task[] {
  return tasks.map(task => mapBackendTask(task, sessions));
}

export function taskToCreatePayload(task: Task): CreateTaskPayload {
  const recurrence = (task as any).recurrence;
  let recurrencePayload: CreateTaskPayload['recurrence'] = undefined;

  if (recurrence && recurrence.repeatDays) {
    recurrencePayload = {
      repeatDays: recurrence.repeatDays,
      recurrenceStart: recurrence.recurrenceStart,
      ...(recurrence.recurrenceEnd ? { recurrenceEnd: recurrence.recurrenceEnd } : {}),
    };
  }

  return {
    title: task.title,
    description: task.description || undefined,
    notes: task.notes || undefined,
    estimatedSeconds: task.estimatedSeconds,
    status: toBackendStatus(task.status),
    priority: task.priority,
    estimatedMinutes: task.estimatedTime,
    scheduledDate: task.date,
    tagIds: task.tags.map(tag => tag.id),
    recurrence: recurrencePayload,
  };
}

export function taskUpdatesToPayload(updates: Partial<Task>): UpdateTaskPayload {
  const payload: UpdateTaskPayload = {};

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.estimatedSeconds !== undefined) {
    payload.estimatedSeconds = updates.estimatedSeconds;
    payload.estimatedMinutes = Math.ceil(updates.estimatedSeconds / 60);
  }
  if (updates.status !== undefined) payload.status = toBackendStatus(updates.status);
  if (updates.priority !== undefined) payload.priority = updates.priority;
  if (updates.estimatedTime !== undefined && updates.estimatedSeconds === undefined) {
    payload.estimatedMinutes = updates.estimatedTime;
  }
  if (updates.date !== undefined) payload.scheduledDate = updates.date;
  if ((updates as any).recurrence !== undefined) payload.recurrence = (updates as any).recurrence;

  return payload;
}
