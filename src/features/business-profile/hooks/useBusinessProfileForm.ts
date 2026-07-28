// Fetches the metadata-driven form schema for a business profile type, and the
// profile-type option set for the type picker.
import { useCallback, useEffect, useState } from 'react';

import type { ListingForm } from '@/features/sell/forms/listingForm.types';
import { logger } from '@/lib';

import { businessProfileApi } from '../api/businessProfileApi';
import type { ProfileTypeOption } from '../types/businessProfile.types';

interface UseBusinessProfileFormResult {
  form: ListingForm | null;
  profileTypes: ProfileTypeOption[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useBusinessProfileForm(
  profileType?: string,
): UseBusinessProfileFormResult {
  const [form, setForm] = useState<ListingForm | null>(null);
  const [profileTypes, setProfileTypes] = useState<ProfileTypeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [formRes, typesRes] = await Promise.all([
        businessProfileApi.getForm(profileType),
        businessProfileApi.getProfileTypes(),
      ]);
      setForm(formRes);
      setProfileTypes(typesRes);
    } catch (error) {
      logger.warn('[BusinessProfile] Failed to load form', { profileType, error });
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [profileType]);

  useEffect(() => {
    void load();
  }, [load]);

  return { form, profileTypes, isLoading, isError, refetch: load };
}
