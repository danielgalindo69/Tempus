import { apiRequest } from './http';
import type { BackendTask, BackendTaskStatus, CreateTaskPayload, UpdateTaskPayload } from './types';

export interface TaskFilters {
  date?: string;
  weekPlanId?: string;
  status?: BackendTaskStatus;
  categoryId?: string;
}

export async function getTasks(filters?: TaskFilters): Promise<BackendTask[]> {
  const response = await apiRequest<{ tasks: BackendTask[] }>('/tasks', {
    query: filters,
  });
  return response.tasks;
}

export async function createTask(payload: CreateTaskPayload): Promise<BackendTask> {
  const response = await apiRequest<{ task: BackendTask }>('/tasks', {
    method: 'POST',
    body: payload,
  });
  return response.task;
}

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<BackendTask> {
  const response = await apiRequest<{ task: BackendTask }>(`/tasks/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return response.task;
}

export async function updateTaskStatus(id: string, status: BackendTaskStatus): Promise<BackendTask> {
  const response = await apiRequest<{ task: BackendTask }>(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
  return response.task;
}
