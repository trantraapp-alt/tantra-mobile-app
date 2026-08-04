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

  // The list endpoint can return a leaner projection than the single-profile
  // fetch (e.g. missing attributes.ownerName), so a card would otherwise show
  // incomplete info even though the full record exists. Backfill each row
  // once in the background — enrichedRef guards against re-fetching a row
  // that still comes back without an owner name (a real gap, not a fluke).
  const enrichedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    profiles.forEach((p) => {
      const hasOwnerName =
        typeof p.attributes?.ownerName === 'string' && p.attributes.ownerName.trim() !== '';
      if (hasOwnerName || enrichedRef.current.has(p.profileId)) {
        return;
      }
      enrichedRef.current.add(p.profileId);
      businessProfileApi
        .getProfile(p.profileId)
        .then((full) => {
          setProfiles((prev) =>
            prev.map((item) =>
              item.profileId === p.profileId
                ? { ...item, attributes: full.attributes, address: full.address }
                : item,
            ),
          );
        })
        .catch((error) => {
          logger.warn('[BusinessProfile] Failed to enrich profile row', {
            profileId: p.profileId,
            error,
          });
        });
    });
  }, [profiles]);

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
