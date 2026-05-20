import { apiRequest } from './http';
import type { BackendUser } from './types';

export interface UpdateUserPayload {
  name?: string;
  timezone?: string;
  avatarUrl?: string | null;
}

export async function updateCurrentUser(payload: UpdateUserPayload): Promise<BackendUser> {
  const response = await apiRequest<{ user: BackendUser }>('/users/me', {
    method: 'PATCH',
    body: payload,
  });
  return response.user;
}
