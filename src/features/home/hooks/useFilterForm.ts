// Loads the backend-driven filter form (cached per category) for the filter
// drawer. Filter definitions rarely change, so the result is memoized at module
// scope for the session.
import { useEffect, useState } from 'react';

import { logger } from '@/lib';

import { getFilterForm } from '../api/filterFormApi';
import type { FilterForm } from '../types';

// Session cache keyed by categoryId ("global" for the no-category form).
const cache = new Map<string, FilterForm>();

// Result of the useFilterForm hook.
export interface UseFilterFormResult {
  // The loaded filter form, or null while loading / on error.
  form: FilterForm | null;
  // True while the first fetch is in flight.
  isLoading: boolean;
  // True when the fetch failed.
  isError: boolean;
}

// Fetches the filter form for the given category (or the global form).
export function useFilterForm(categoryId?: number): UseFilterFormResult {
  const key = categoryId != null ? String(categoryId) : 'global';
  const [form, setForm] = useState<FilterForm | null>(
    () => cache.get(key) ?? null,
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>(
    cache.has(key) ? 'idle' : 'loading',
  );

  useEffect(() => {
    const cached = cache.get(key);
    if (cached) {
      setForm(cached);
      setStatus('idle');
      return;
    }
    let active = true;
    setStatus('loading');
    getFilterForm(categoryId)
      .then((data) => {
        if (!active) {
          return;
        }
        cache.set(key, data);
        setForm(data);
        setStatus('idle');
      })
      .catch((error) => {
        if (active) {
          logger.warn('[Filters] Failed to load filter form', error);
          setStatus('error');
        }
      });
    return () => {
      active = false;
    };
  }, [categoryId, key]);

  return { form, isLoading: status === 'loading', isError: status === 'error' };
}
