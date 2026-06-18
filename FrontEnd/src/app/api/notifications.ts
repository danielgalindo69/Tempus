import { apiRequest } from './http';

export interface BackendNotification {
  id: string;
  userId: string;
  taskId: string | null;
  type: 'task_start' | 'task_reminder' | 'task_end' | 'system';
  title: string;
  body: string | null;
  isRead: boolean;
  isSent: boolean;
  scheduledFor: string;
  sentAt: string | null;
  createdAt: string;
  task?: {
    id: string;
    title: string;
  } | null;
}

export interface PaginatedNotifications {
  data: BackendNotification[];
  nextCursor: string | null;
}

export async function getNotifications(params?: { unreadOnly?: boolean; limit?: number; cursor?: string }): Promise<PaginatedNotifications> {
  return apiRequest<PaginatedNotifications>('/notifications', {
    query: {
      unreadOnly: params?.unreadOnly,
      limit: params?.limit,
      cursor: params?.cursor,
    },
  });
}

export async function markNotificationsAsRead(ids?: string[]): Promise<void> {
  return apiRequest<void>('/notifications/read', {
    method: 'PATCH',
    body: ids ? { notificationIds: ids } : {},
  });
}

export async function deleteNotification(id: string): Promise<void> {
  return apiRequest<void>(`/notifications/${id}`, { method: 'DELETE' });
}
