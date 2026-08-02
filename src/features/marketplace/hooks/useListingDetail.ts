// Loads a single listing's detail plus its similar listings in parallel. A
// failure to load the similar rail does not fail the whole screen.
import { useCallback, useEffect, useState } from 'react';

import type { FeedListing } from '@/features/home';
import { logger } from '@/lib';

import { marketplaceApi } from '../api';

// Result of the useListingDetail hook.
export interface UseListingDetailResult {
  listing: FeedListing | null;
  similar: FeedListing[];
  isLoading: boolean;
  isError: boolean;
  reload: () => void;
}

// Loads the detail for a listing id.
export function useListingDetail(listingId: string): UseListingDetailResult {
  const [listing, setListing] = useState<FeedListing | null>(null);
  const [similar, setSimilar] = useState<FeedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (!listingId) {
      setIsError(true);
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    setIsError(false);

    Promise.all([
      marketplaceApi.getListingDetail(listingId),
      marketplaceApi
        .getSimilar(listingId, 6)
        .catch(() => [] as FeedListing[]),
    ])
      .then(([detail, sim]) => {
        if (active) {
          setListing(detail);
          setSimilar(Array.isArray(sim) ? sim : []);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        logger.warn('[Listing] detail load failed', error);
        if (active) {
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [listingId, reloadKey]);

  return { listing, similar, isLoading, isError, reload };
}
