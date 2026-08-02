// Loads the aggregated home feed for the user's selected district (and the
// active language, injected globally by the http client), exposing initial-load
// and pull-to-refresh states independently so a refresh never blanks the screen.
import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '@/lib';
import { useAppSelector } from '@/store/hooks';
import { selectSelectedLocation } from '@/store/selectors';

import { homeApi } from '../api';
import type { HomeFeed } from '../types';

// Coerces a raw feed payload into a fully-populated shape. The endpoint is
// public and mixes several entity types, so a section may arrive missing or
// null; defaulting every collection to an array here means the screen can read
// `.length` / `.map` on any of them without a guard at every call site.
function normalizeFeed(raw: HomeFeed | null | undefined): HomeFeed {
  const featured = raw?.featuredListings;
  return {
    generatedAt: raw?.generatedAt,
    modules: raw?.modules ?? [],
    promoCards: raw?.promoCards ?? [],
    featuredListings: featured
      ? { title: featured.title ?? null, listings: featured.listings ?? [] }
      : null,
    moduleSections: raw?.moduleSections ?? [],
    featuredProfiles: raw?.featuredProfiles ?? [],
    recentListings: raw?.recentListings ?? [],
  };
}

// Result of the useHomeFeed hook.
export interface UseHomeFeedResult {
  // The loaded feed, or null before the first successful load.
  feed: HomeFeed | null;
  // True during the initial load only (drives the skeleton).
  isLoading: boolean;
  // True during a pull-to-refresh (keeps the current feed on screen).
  isRefreshing: boolean;
  // True when the load failed and there is nothing to show.
  isError: boolean;
  // Re-fetches the feed as a refresh.
  refresh: () => Promise<void>;
}

// Loads and refreshes the home feed.
export function useHomeFeed(): UseHomeFeedResult {
  const location = useAppSelector(selectSelectedLocation);
  // Device reverse-geocoding (and some PIN lookups) often leave `district`
  // empty while `city` holds the place name, so fall back through city → state.
  // Without this the feed would send no location and never change when the user
  // picks a new place from the header.
  const district =
    location?.district?.trim() ||
    location?.city?.trim() ||
    location?.state?.trim() ||
    undefined;

  const [feed, setFeed] = useState<HomeFeed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);

  // Guards state writes after unmount, and reads the latest feed inside `load`
  // without re-creating the callback on every fetch.
  const mountedRef = useRef(true);
  const hasFeedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setIsError(false);
      try {
        const data = await homeApi.getHomeFeed({ district });
        if (mountedRef.current) {
          hasFeedRef.current = true;
          setFeed(normalizeFeed(data));
        }
      } catch (error) {
        logger.warn('[Home] Feed load failed', error);
        if (mountedRef.current && !hasFeedRef.current) {
          setIsError(true);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [district],
  );

  // Re-load whenever the district changes (including the first mount).
  useEffect(() => {
    void load('initial');
  }, [load]);

  const refresh = useCallback(() => load('refresh'), [load]);

  return { feed, isLoading, isRefreshing, isError, refresh };
}
