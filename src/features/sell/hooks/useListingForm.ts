// Fetches a category's server-driven listing form from the API on demand.
import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/lib';

import { modulesApi } from '../api';
import type { ListingForm } from '../forms/listingForm.types';

// Fetch lifecycle status.
type FormStatus = 'loading' | 'success' | 'error';

// Loads the listing form for a category (defaults to the SELL variant).
export function useListingForm(categoryId: number, listingType = 'SELL') {
  const [form, setForm] = useState<ListingForm | null>(null);
  const [status, setStatus] = useState<FormStatus>('loading');

  // Fetches the form schema for the current category. Some categories register
  // their form under BOTH (sell + rent) instead of SELL, so we fall back to
  // BOTH when the requested listing type has no active form.
  const load = useCallback(async () => {
    setStatus('loading');
    const candidates =
      listingType === 'BOTH' ? ['BOTH'] : [listingType, 'BOTH'];
    let lastError: unknown = null;

    for (const type of candidates) {
      const endpoint = `/categories/${categoryId}/form?listingType=${type}`;
      logger.info('[Sell] Fetching listing form', { categoryId, endpoint });
      try {
        const result = await modulesApi.getListingForm(categoryId, type);
        logger.info('[Sell] Listing form loaded', {
          categoryId,
          endpoint,
          formId: result.formId,
          title: result.title?.en,
          sections: result.sections?.length,
        });
        setForm(result);
        setStatus('success');
        return;
      } catch (error) {
        lastError = error;
        logger.warn('[Sell] Listing form attempt failed', {
          categoryId,
          endpoint,
          error,
        });
      }
    }

    logger.warn('[Sell] Listing form failed (all listing types)', {
      categoryId,
      error: lastError,
    });
    setStatus('error');
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
