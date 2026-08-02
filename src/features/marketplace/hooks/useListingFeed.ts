// Generic paginated listing feed. The caller supplies a memoized `fetchPage`
// (built from its filters / id); the hook reloads from page 0 whenever that
// identity changes, appends on `loadMore`, and exposes independent loading /
// refreshing / error states. `enabled` lets a screen defer fetching (e.g. Nearby
// before a location is known).
import { useCallback, useEffect, useRef, useState } from 'react';

import type { FeedListing } from '@/features/home';
import { logger } from '@/lib';

import type { MarketplacePage } from '../types';

// Current fetch phase.
type Phase = 'idle' | 'loading' | 'loadingMore' | 'refreshing' | 'error';

// A page fetcher for a given zero-based page index.
export type ListingPageFetcher = (
  page: number,
) => Promise<MarketplacePage<FeedListing>>;

// Options controlling the feed.
export interface UseListingFeedOptions {
  // When false, no fetching happens and the list stays empty (default true).
  enabled?: boolean;
}

// The feed state returned to a screen.
export interface UseListingFeedResult {
  listings: FeedListing[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  isError: boolean;
  isEmpty: boolean;
  hasMore: boolean;
  // Total matching elements across all pages (0 when unknown).
  total: number;
  loadMore: () => void;
  refresh: () => void;
}

// Manages a paginated listing feed for the given fetcher.
export function useListingFeed(
  fetchPage: ListingPageFetcher,
  { enabled = true }: UseListingFeedOptions = {},
): UseListingFeedResult {
  const [listings, setListings] = useState<FeedListing[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [total, setTotal] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');
  // Guards against out-of-order responses when the fetcher changes quickly.
  const requestId = useRef(0);

  const run = useCallback(
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
        const res = await fetchPage(pageToLoad);
        if (id !== requestId.current) {
          return;
        }
        const content = res.content ?? [];
        setListings((prev) =>
          mode === 'append' ? [...prev, ...content] : content,
        );
        setPage(res.number ?? res.page ?? pageToLoad);
        setLast(res.last ?? true);
        if (res.totalElements != null) {
          setTotal(res.totalElements);
        }
        setPhase('idle');
      } catch (error) {
        if (id !== requestId.current) {
          return;
        }
        logger.warn('[Marketplace] Failed to load listings', error);
        setPhase('error');
      }
    },
    [fetchPage],
  );

  // Reload from the first page whenever the fetcher changes or is enabled.
  useEffect(() => {
    if (!enabled) {
      requestId.current += 1; // cancel any in-flight response
      setListings([]);
      setLast(true);
      setTotal(0);
      setPhase('idle');
      return;
    }
    void run(0, 'replace');
  }, [run, enabled]);

  const loadMore = useCallback(() => {
    if (
      !enabled ||
      last ||
      phase === 'loading' ||
      phase === 'loadingMore' ||
      phase === 'refreshing'
    ) {
      return;
    }
    void run(page + 1, 'append');
  }, [enabled, last, phase, page, run]);

  const refresh = useCallback(() => {
    if (enabled) {
      void run(0, 'refresh');
    }
  }, [enabled, run]);

  return {
    listings,
    isLoading: phase === 'loading',
    isLoadingMore: phase === 'loadingMore',
    isRefreshing: phase === 'refreshing',
    isError: phase === 'error',
    isEmpty: phase === 'idle' && listings.length === 0,
    hasMore: !last,
    total,
    loadMore,
    refresh,
  };
}
