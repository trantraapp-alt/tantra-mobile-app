// Loads notifications with pagination and marks them read locally + on the
// server so the list and the unread dot update instantly.
import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '@/lib';

import { notificationsApi } from '../api';
import type { AppNotification } from '../types';

// Current fetch phase.
type Phase = 'loading' | 'loadingMore' | 'refreshing' | 'idle' | 'error';

// Reads a notification's id as a string.
function idOf(notification: AppNotification): string {
  return String(notification.id);
}

// Manages the notifications list.
export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [phase, setPhase] = useState<Phase>('loading');
  const requestId = useRef(0);

  const fetchPage = useCallback(
    async (pageToLoad: number, mode: 'replace' | 'append' | 'refresh') => {
      const id = requestId.current + 1;
      requestId.current = id;
      setPhase(
        mode === 'append'
          ? 'loadingMore'
          : mode === 'refresh'
            ? 'refreshing'
            : 'loading',
      );
      try {
        const res = await notificationsApi.list(pageToLoad);
        if (id !== requestId.current) {
          return;
        }
        const content = res.content ?? [];
        setNotifications((prev) =>
          mode === 'append' ? [...prev, ...content] : content,
        );
        setPage(pageToLoad);
        setLast(res.last ?? true);
        setPhase('idle');
      } catch (error) {
        if (id !== requestId.current) {
          return;
        }
        logger.warn('[Notifications] Failed to load', error);
        setPhase('error');
      }
    },
    [],
  );

  useEffect(() => {
    void fetchPage(0, 'replace');
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (last || phase !== 'idle') {
      return;
    }
    void fetchPage(page + 1, 'append');
  }, [last, phase, page, fetchPage]);

  const refresh = useCallback(() => {
    void fetchPage(0, 'refresh');
  }, [fetchPage]);

  // Marks one notification read (optimistic + server).
  const markRead = useCallback((notification: AppNotification) => {
    if (notification.isRead) {
      return;
    }
    const id = idOf(notification);
    setNotifications((prev) =>
      prev.map((item) =>
        idOf(item) === id ? { ...item, isRead: true } : item,
      ),
    );
    void notificationsApi.markRead(id).catch((error) => {
      logger.warn('[Notifications] Mark read failed', error);
    });
  }, []);

  // Marks every notification read (optimistic + server).
  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    void notificationsApi.markAllRead().catch((error) => {
      logger.warn('[Notifications] Mark all read failed', error);
    });
  }, []);

  return {
    notifications,
    isLoading: phase === 'loading',
    isLoadingMore: phase === 'loadingMore',
    isRefreshing: phase === 'refreshing',
    isError: phase === 'error',
    isEmpty: phase === 'idle' && notifications.length === 0,
    loadMore,
    refresh,
    markRead,
    markAllRead,
  };
}
