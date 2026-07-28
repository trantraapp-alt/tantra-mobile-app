// Paginated admin list of business profiles filtered by status.
import { useCallback, useEffect, useRef, useState } from 'react';

import { appConstants } from '@/constants';
import { logger } from '@/lib';

import { businessProfileApi } from '../api/businessProfileApi';
import type { BusinessProfile } from '../types/businessProfile.types';

type Phase = 'loading' | 'loadingMore' | 'refreshing' | 'idle' | 'error';

interface UseAdminProfilesArgs {
  status?: string;
  sort?: string;
  useHistory?: boolean;
}

export function useAdminProfiles({
  status,
  sort,
  useHistory = false,
}: UseAdminProfilesArgs = {}) {
  const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [phase, setPhase] = useState<Phase>('loading');
  const requestId = useRef(0);

  const fetchPage = useCallback(
    async (pageToLoad: number, mode: 'replace' | 'append' | 'refresh') => {
      const id = requestId.current + 1;
      requestId.current = id;
      setPhase(
        mode === 'append'
          ? 'loadingMore'
          : mode === 'refresh'
            ? 'refreshing'
            : 'loading',
      );
      try {
        const res = useHistory
          ? await businessProfileApi.getHistory({
              page: pageToLoad,
              size: appConstants.defaultPageSize,
            })
          : await businessProfileApi.getAdminList({
              status,
              sort,
              page: pageToLoad,
              size: appConstants.defaultPageSize,
            });
        if (id !== requestId.current) {
          return;
        }
        const content = res.content ?? [];
        setProfiles((prev) =>
          mode === 'append' ? [...prev, ...content] : content,
        );
        setPage(res.page ?? pageToLoad);
        setLast(res.last ?? true);
        setPhase('idle');
      } catch (error) {
        if (id !== requestId.current) {
          return;
        }
        logger.warn('[BusinessProfile] Admin list failed', { status, error });
        setPhase('error');
      }
    },
    [status, sort, useHistory],
  );

  useEffect(() => {
    void fetchPage(0, 'replace');
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (
      last ||
      phase === 'loading' ||
      phase === 'loadingMore' ||
      phase === 'refreshing'
    ) {
      return;
    }
    void fetchPage(page + 1, 'append');
  }, [last, phase, page, fetchPage]);

  const refresh = useCallback(() => {
    void fetchPage(0, 'refresh');
  }, [fetchPage]);

  const removeLocal = useCallback((profileId: string) => {
    setProfiles((prev) => prev.filter((p) => p.profileId !== profileId));
  }, []);

  return {
    profiles,
    isLoading: phase === 'loading',
    isLoadingMore: phase === 'loadingMore',
    isRefreshing: phase === 'refreshing',
    isError: phase === 'error',
    isEmpty: phase === 'idle' && profiles.length === 0,
    hasMore: !last,
    loadMore,
    refresh,
    removeLocal,
  };
}
