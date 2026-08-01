// Paginated list of the current user's own business profiles, with optimistic
// local mutators (patchLocal / removeLocal) mirroring the useMyListings pattern.
import { useCallback, useEffect, useRef, useState } from 'react';

import { appConstants } from '@/constants';
import { logger } from '@/lib';

import { businessProfileApi } from '../api/businessProfileApi';
import type { BusinessProfile } from '../types/businessProfile.types';

type Phase = 'loading' | 'loadingMore' | 'refreshing' | 'idle' | 'error';

export function useMyProfiles() {
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
        const res = await businessProfileApi.getMyProfiles({
          page: pageToLoad,
          size: appConstants.defaultPageSize,
        });

        if (id !== requestId.current) {
          return;
        }

        const isArrayRes = Array.isArray(res);
        const content = isArrayRes ? res : (res.content ?? []);
        const currentPage = !isArrayRes && typeof res.page === 'number' ? res.page : pageToLoad;
        const isLast =
          !isArrayRes && typeof res.last === 'boolean'
            ? res.last
            : content.length < appConstants.defaultPageSize;

        setProfiles((prev) =>
          mode === 'append' ? [...prev, ...content] : content,
        );
        setPage(currentPage);
        setLast(isLast);
        setPhase('idle');
      } catch (error) {
        if (id !== requestId.current) {
          return;
        }
        logger.warn('[BusinessProfile] Failed to load profiles', error);
        setPhase('error');
      }
    },
    [],
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

  const patchLocal = useCallback(
    (profileId: string, updated: Partial<BusinessProfile>) => {
      setProfiles((prev) =>
        prev.map((p) =>
          p.profileId === profileId ? { ...p, ...updated } : p,
        ),
      );
    },
    [],
  );

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
    patchLocal,
    removeLocal,
  };
}
