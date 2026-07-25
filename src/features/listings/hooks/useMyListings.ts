// Loads the current user's listings with pagination and status/type filters,
// and exposes local mutators so inline edits, status changes and deletes update
// the on-screen list instantly without a full refetch.
import { useCallback, useEffect, useRef, useState } from 'react';

import { appConstants } from '@/constants';
import { logger } from '@/lib';

import { listingsApi } from '../api';
import type { MyListing } from '../types';
import { getListingId } from '../utils/listingDisplay';

// Current fetch phase.
type Phase = 'loading' | 'loadingMore' | 'refreshing' | 'idle' | 'error';

// Arguments controlling which listings are loaded.
interface UseMyListingsArgs {
  // SELL or RENT.
  listingType: string;
  // Optional status filter (omit for all).
  status?: string;
}

// Manages the paginated My Listings collection for the active filters.
export function useMyListings({ listingType, status }: UseMyListingsArgs) {
  const [listings, setListings] = useState<MyListing[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [phase, setPhase] = useState<Phase>('loading');
  // Guards against out-of-order responses when filters change quickly.
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
        const res = await listingsApi.getMyListings({
          listingType,
          status,
          page: pageToLoad,
          size: appConstants.defaultPageSize,
        });
        if (id !== requestId.current) {
          return;
        }
        const content = res.content ?? [];
        setListings((prev) =>
          mode === 'append' ? [...prev, ...content] : content,
        );
        setPage(res.page ?? res.number ?? pageToLoad);
        setLast(res.last ?? true);
        setPhase('idle');
      } catch (error) {
        if (id !== requestId.current) {
          return;
        }
        logger.warn('[Listings] Failed to load listings', {
          listingType,
          status,
          error,
        });
        setPhase('error');
      }
    },
    [listingType, status],
  );

  // Reload from the first page whenever the filters change.
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

  // Merges updated fields into a listing already in the list.
  const patchLocal = useCallback((id: string, updated: Partial<MyListing>) => {
    setListings((prev) =>
      prev.map((item) =>
        getListingId(item) === id ? { ...item, ...updated } : item,
      ),
    );
  }, []);

  // Removes a listing from the list (after delete, or when it no longer matches
  // the active filter).
  const removeLocal = useCallback((id: string) => {
    setListings((prev) => prev.filter((item) => getListingId(item) !== id));
  }, []);

  return {
    listings,
    isLoading: phase === 'loading',
    isLoadingMore: phase === 'loadingMore',
    isRefreshing: phase === 'refreshing',
    isError: phase === 'error',
    isEmpty: phase === 'idle' && listings.length === 0,
    hasMore: !last,
    loadMore,
    refresh,
    patchLocal,
    removeLocal,
  };
}
