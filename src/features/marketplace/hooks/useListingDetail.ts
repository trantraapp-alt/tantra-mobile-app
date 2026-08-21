// Loads a single listing's detail, its category's form schema and its similar
// listings. A failure to load the similar rail does not fail the whole screen.
import { useCallback, useEffect, useState } from 'react';

import type { FeedListing } from '@/features/home';
import { fetchCategoryForm, type ListingForm } from '@/features/sell';
import { logger } from '@/lib';

import { marketplaceApi } from '../api';

// Result of the useListingDetail hook.
export interface UseListingDetailResult {
  listing: FeedListing | null;
  /**
   * The category's form schema — the source of every field label, option label
   * and section on the detail page. Null when the listing carries no category or
   * the schema could not be loaded; the screen then falls back to the raw
   * attribute keys rather than showing nothing.
   */
  form: ListingForm | null;
  similar: FeedListing[];
  isLoading: boolean;
  isError: boolean;
  reload: () => void;
}

// Loads the detail for a listing id.
export function useListingDetail(listingId: string): UseListingDetailResult {
  const [listing, setListing] = useState<FeedListing | null>(null);
  const [form, setForm] = useState<ListingForm | null>(null);
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
      marketplaceApi.getSimilar(listingId, 6).catch(() => [] as FeedListing[]),
    ])
      .then(async ([detail, sim]) => {
        // The schema needs the listing's categoryId, so it can only be fetched
        // once the detail is in. It is awaited here (rather than set later) so
        // the page paints once, with the real field labels already resolved —
        // `fetchCategoryForm` is cached, so repeat visits cost nothing. A schema
        // failure is not a page failure: the screen degrades to raw keys.
        const schema = detail?.categoryId
          ? await fetchCategoryForm(
              detail.categoryId,
              String(detail.listingType ?? 'SELL').toUpperCase(),
            ).catch((error) => {
              logger.warn('[Listing] category form load failed', {
                categoryId: detail.categoryId,
                error,
              });
              return null;
            })
          : null;

        if (active) {
          setListing(detail);
          setForm(schema);
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

  return { listing, form, similar, isLoading, isError, reload };
}
