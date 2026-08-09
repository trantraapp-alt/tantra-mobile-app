// Loads the "Today's Deals" cards for a location. Re-fetches when the coordinate
// changes; returns an empty array on failure / when there are none, so the strip
// simply hides.
import { useEffect, useState } from 'react';

import type { GeoPoint } from '@/features/marketplace';
import { logger } from '@/lib';

import { getDeals } from '../api';
import type { DealCard } from '../types';

// Result of the deals hook.
export interface UseDealsResult {
  cards: DealCard[];
  isLoading: boolean;
  isError: boolean;
}

// Returns the deal cards for the given location.
export function useDeals(geo: GeoPoint | undefined): UseDealsResult {
  const [cards, setCards] = useState<DealCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Depend on the primitive coordinates, not the geo object identity.
  const lat = geo?.lat ?? null;
  const lng = geo?.lng ?? null;

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setIsError(false);
    getDeals(lat != null && lng != null ? { lat, lng } : undefined)
      .then((data) => {
        const next = Array.isArray(data) ? data : [];
        if (active) {
          setCards(next);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (active) {
          logger.warn('[Deals] Failed to load deals', error);
          setCards([]);
          setIsError(true);
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [lat, lng]);

  return { cards, isLoading, isError };
}
