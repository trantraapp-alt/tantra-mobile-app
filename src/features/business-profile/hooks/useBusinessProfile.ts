// Fetches a single business profile by id.
import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/lib';

import { businessProfileApi } from '../api/businessProfileApi';
import type { BusinessProfile } from '../types/businessProfile.types';

interface UseBusinessProfileResult {
  profile: BusinessProfile | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useBusinessProfile(profileId: string): UseBusinessProfileResult {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await businessProfileApi.getProfile(profileId);
      setProfile(res);
    } catch (error) {
      logger.warn('[BusinessProfile] Failed to load profile', { profileId, error });
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { profile, isLoading, isError, refetch: load };
}
