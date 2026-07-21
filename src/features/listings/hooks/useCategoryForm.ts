// Loads (and caches) a category's form schema, used by the edit form and the
// inline quick-edit sheet. Skips fetching until a categoryId is provided.
import { useCallback, useEffect, useState } from 'react';

import type { ListingForm } from '@/features/sell';
import { logger } from '@/lib';

import { fetchCategoryForm } from '../api';

type Status = 'idle' | 'loading' | 'success' | 'error';

// Fetches the form schema for a category (defaults to the SELL variant).
export function useCategoryForm(categoryId?: number, listingType = 'SELL') {
  const [form, setForm] = useState<ListingForm | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  const load = useCallback(async () => {
    if (!categoryId) {
      setForm(null);
      setStatus('idle');
      return;
    }
    setStatus('loading');
    try {
      const result = await fetchCategoryForm(categoryId, listingType);
      setForm(result);
      setStatus('success');
    } catch (error) {
      logger.warn('[Listings] Failed to load category form', {
        categoryId,
        error,
      });
      setForm(null);
      setStatus('error');
    }
  }, [categoryId, listingType]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    form,
    isLoading: status === 'loading',
    isError: status === 'error',
    refetch: load,
  };
}
