// Loads marketplace modules into Redux and exposes them with the app language.
import { useCallback, useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectAppLanguage,
  selectModules,
  selectModulesStatus,
} from '@/store/selectors';
import { fetchModulesThunk } from '@/store/slices';

// Fetches modules on first use and returns them with loading state.
export function useModules() {
  const dispatch = useAppDispatch();
  const modules = useAppSelector(selectModules);
  const status = useAppSelector(selectModulesStatus);
  const language = useAppSelector(selectAppLanguage);

  // Re-fetches the modules list.
  const refetch = useCallback(() => {
    void dispatch(fetchModulesThunk());
  }, [dispatch]);

  // Load modules once if they have not been fetched yet.
  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchModulesThunk());
    }
  }, [dispatch, status]);

  return {
    modules,
    language,
    isLoading: status === 'loading',
    isError: status === 'error',
    refetch,
  };
}
