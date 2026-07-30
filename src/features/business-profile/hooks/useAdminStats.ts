// Fetches admin dashboard count tiles.
import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/lib';

import { businessProfileApi } from '../api/businessProfileApi';
import type { AdminBusinessProfileStats } from '../types/businessProfile.types';

export function useAdminStats() {
  const [stats, setStats] = useState<AdminBusinessProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await businessProfileApi.getStats();
      setStats(res);
    } catch (error) {
      logger.warn('[BusinessProfile] Failed to load stats', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, isLoading, isError, refetch: load };
}
