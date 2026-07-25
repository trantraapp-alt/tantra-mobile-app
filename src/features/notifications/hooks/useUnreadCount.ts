// Polls the unread-notification count on focus for the header bell badge.
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { logger } from '@/lib';

import { notificationsApi } from '../api';

// Returns the current unread notification count.
export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const result = await notificationsApi.unreadCount();
      if (mounted.current) {
        setCount(result?.count ?? 0);
      }
    } catch (error) {
      logger.warn('[Notifications] Unread count failed', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      mounted.current = true;
      void refresh();
      return () => {
        mounted.current = false;
      };
    }, [refresh]),
  );

  return { count, refresh };
}
