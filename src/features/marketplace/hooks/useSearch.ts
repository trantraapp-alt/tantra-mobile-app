// Unified search state: fetches matching listings (paginated) and business
// profiles for a query + filters. Reloads when the query, filters or GPS point
// change; appends listings on loadMore; keeps the businesses from page 0.
import { useCallback, useEffect, useRef, useState } from 'react';

import { appConstants } from '@/constants';
import type { FeaturedBusiness, FeedListing } from '@/features/home';
import { logger } from '@/lib';

import { marketplaceApi } from '../api';
import type { GeoPoint, ListingFilters } from '../types';
import { hasActiveFilters } from '../utils/filterState';

// Current fetch phase.
type Phase = 'idle' | 'loading' | 'loadingMore' | 'refreshing' | 'error';

// Search state returned to the screen.
export interface UseSearchResult {
  listings: FeedListing[];
  businesses: FeaturedBusiness[];
  totalListings: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  isError: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

// Runs a unified search for the given query and filters.
export function useSearch(
  query: string,
  filters: ListingFilters,
  geo: GeoPoint | undefined,
): UseSearchResult {
  const [listings, setListings] = useState<FeedListing[]>([]);
  const [businesses, setBusinesses] = useState<FeaturedBusiness[]>([]);
  const [totalListings, setTotalListings] = useState(0);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [phase, setPhase] = useState<Phase>('idle');
  const requestId = useRef(0);
  const size = appConstants.defaultPageSize;

  const trimmed = query.trim();
  const filtersActive = hasActiveFilters(filters);

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
        const res = await marketplaceApi.search(
          trimmed,
          filters,
          geo,
          pageToLoad,
          size,
        );
        if (id !== requestId.current) {
          return;
        }
        const content = res.listings ?? [];
        setListings((prev) =>
          mode === 'append' ? [...prev, ...content] : content,
        );
        if (mode !== 'append') {
          setBusinesses(res.businessProfiles ?? []);
        }
        setTotalListings(res.totalListings ?? content.length);
        const current = res.currentPage ?? pageToLoad;
        const totalPages = res.totalPages ?? 1;
        setPage(current);
        setLast(current >= totalPages - 1);
        setPhase('idle');
      } catch (error) {
        if (id !== requestId.current) {
          return;
        }
        logger.warn('[Marketplace] Search failed', error);
        setPhase('error');
      }
    },
    [trimmed, filters, geo, size],
  );

  // Reload on query / filter / geo change; clear only when neither a query nor
  // any active filter is present (so filters alone can drive a browse).
  useEffect(() => {
    if (trimmed === '' && !filtersActive) {
      requestId.current += 1;
      setListings([]);
      setBusinesses([]);
      setTotalListings(0);
      setLast(true);
      setPhase('idle');
      return;
    }
    void run(0, 'replace');
  }, [run, trimmed, filtersActive]);

  const loadMore = useCallback(() => {
    if (
      last ||
      (trimmed === '' && !filtersActive) ||
      phase === 'loading' ||
      phase === 'loadingMore' ||
      phase === 'refreshing'
    ) {
      return;
    }
    void run(page + 1, 'append');
  }, [last, trimmed, filtersActive, phase, page, run]);

  const refresh = useCallback(() => {
    if (trimmed !== '' || filtersActive) {
      void run(0, 'refresh');
    }
  }, [trimmed, filtersActive, run]);

  return {
    listings,
    businesses,
    totalListings,
    isLoading: phase === 'loading',
    isLoadingMore: phase === 'loadingMore',
    isRefreshing: phase === 'refreshing',
    isError: phase === 'error',
    hasMore: !last,
    loadMore,
    refresh,
  };
}
