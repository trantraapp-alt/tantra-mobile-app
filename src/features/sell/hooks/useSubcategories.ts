// Fetches a category's subcategories (children). An empty result means the
// category is itself a leaf whose form should open directly.
import { useCallback, useEffect, useState } from 'react';

import type { ModuleCategory } from '@/types';

import { modulesApi } from '../api';

// Loads the subcategories of a parent category.
export function useSubcategories(parentId: number) {
  const [subcategories, setSubcategories] = useState<ModuleCategory[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await modulesApi.getSubcategories(parentId);
      setSubcategories(Array.isArray(result) ? result : []);
      setStatus('success');
    } catch {
      // A leaf category may 404 on this endpoint — treat that as "no children"
      // so the form still opens rather than surfacing an error.
      setSubcategories([]);
      setStatus('success');
    }
  }, [parentId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    subcategories,
    isLoading: status === 'loading',
    isError: status === 'error',
    refetch: load,
  };
}
