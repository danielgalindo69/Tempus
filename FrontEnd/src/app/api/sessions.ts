import { apiRequest } from './http';
import type { BackendTimeSession } from './types';

export async function getSessions(taskId?: string): Promise<BackendTimeSession[]> {
  const response = await apiRequest<{ sessions: BackendTimeSession[] }>('/sessions', {
    query: { taskId },
  });
  return response.sessions;
}

export async function getActiveSession(): Promise<BackendTimeSession | null> {
  const response = await apiRequest<{ session: BackendTimeSession | null }>('/sessions/active');
  return response.session;
}

export async function startSession(taskId: string): Promise<BackendTimeSession> {
  const response = await apiRequest<{ session: BackendTimeSession }>('/sessions/start', {
    method: 'POST',
    body: { taskId },
  });
  return response.session;
}

export async function stopSession(sessionId: string, note?: string): Promise<BackendTimeSession> {
  const response = await apiRequest<{ session: BackendTimeSession }>('/sessions/stop', {
    method: 'POST',
    body: { sessionId, note },
  });
  return response.session;
}
