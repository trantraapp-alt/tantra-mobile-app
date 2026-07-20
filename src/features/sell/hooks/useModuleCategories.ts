// Loads a module's categories into Redux and exposes them with the app language.
import { useCallback, useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAppLanguage, selectModuleCategories } from '@/store/selectors';
import { fetchModuleCategoriesThunk } from '@/store/slices';

// Fetches a module's categories on mount and returns them with loading state.
export function useModuleCategories(moduleId: number) {
  const dispatch = useAppDispatch();
  const selectCategories = useMemo(
    () => selectModuleCategories(moduleId),
    [moduleId],
  );
  const { status, items, error } = useAppSelector(selectCategories);
  const language = useAppSelector(selectAppLanguage);

  // Re-fetches the categories for the module.
  const refetch = useCallback(() => {
    void dispatch(fetchModuleCategoriesThunk(moduleId));
  }, [dispatch, moduleId]);

  // Load categories once if they have not been fetched yet.
  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchModuleCategoriesThunk(moduleId));
    }
  }, [dispatch, moduleId, status]);

  return {
    categories: items,
    language,
    isLoading: status === 'loading',
    isError: status === 'error',
    error,
    refetch,
  };
}
