// Fetches a single user's full detail. The list row navigated from is a much
// leaner projection (no activity/subscription/business-profile/addresses), so
// there is nothing meaningful to render instantly from cache the way the
// business-profile review screen does — this always fetches, but only shows
// the blocking spinner/error UI while there is truly nothing on screen yet
// (the caller can paint the cached summary's identity fields in the meantime).
import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/lib';

import { adminUsersApi } from '../api/adminUsersApi';
import type { AdminUserDetail } from '../types/adminUser.types';

export function useAdminUserDetail(userId: string) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      return;
    }
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await adminUsersApi.getDetail(userId);
      setDetail(res);
    } catch (error) {
      logger.warn('[AdminUsers] Failed to load user detail', { userId, error });
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { detail, isLoading, isError, refetch: load };
}
