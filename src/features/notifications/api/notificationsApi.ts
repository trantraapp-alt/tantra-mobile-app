// Repository layer for notifications.
import { endpoints } from '@/config';
import { appConstants } from '@/constants';
import { apiClient } from '@/lib';

import type { NotificationPage, UnreadCount } from '../types';

// Fetches a page of notifications.
function list(page: number): Promise<NotificationPage> {
  return apiClient.get<NotificationPage>(endpoints.notifications.list, {
    params: { page, size: appConstants.defaultPageSize },
  });
}

// Fetches the current unread count.
function unreadCount(): Promise<UnreadCount> {
  return apiClient.get<UnreadCount>(endpoints.notifications.unreadCount);
}

// Marks a single notification as read.
function markRead(id: string): Promise<unknown> {
  return apiClient.patch<unknown, undefined>(
    endpoints.notifications.read(id),
    undefined,
  );
}

// Marks every notification as read.
function markAllRead(): Promise<unknown> {
  return apiClient.patch<unknown, undefined>(
    endpoints.notifications.readAll,
    undefined,
  );
}

// Notifications repository.
export const notificationsApi = {
  list,
  unreadCount,
  markRead,
  markAllRead,
} as const;
