// Fetches admin dashboard count tiles.
import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/lib';

import { businessProfileApi } from '../api/businessProfileApi';
import type { AdminBusinessProfileStats } from '../types/businessProfile.types';

export function useAdminStats() {
  const [stats, setStats] = useState<AdminBusinessProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // `silent` skips the loading flag so a focus-triggered refresh (e.g.
  // returning from an approve/reject/block action) updates the counts without
  // flashing the full-screen spinner over the tiles the admin is looking at.
  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    setIsError(false);
    try {
      const res = await businessProfileApi.getStats();
      setStats(res);
    } catch (error) {
      logger.warn('[BusinessProfile] Failed to load stats', error);
      setIsError(true);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, isLoading, isError, refetch: load };
}
