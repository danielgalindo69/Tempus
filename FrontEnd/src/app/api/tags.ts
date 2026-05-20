import { apiRequest } from './http';
import type { BackendTag } from './types';

export interface CreateTagPayload {
  name: string;
  colorHex: string;
}

export async function getTags(): Promise<BackendTag[]> {
  const response = await apiRequest<{ tags: BackendTag[] }>('/tags');
  return response.tags;
}

export async function createTag(payload: CreateTagPayload): Promise<BackendTag> {
  const response = await apiRequest<{ tag: BackendTag }>('/tags', {
    method: 'POST',
    body: payload,
  });
  return response.tag;
}

export async function deleteTag(id: string): Promise<void> {
  await apiRequest(`/tags/${id}`, {
    method: 'DELETE',
  });
}
