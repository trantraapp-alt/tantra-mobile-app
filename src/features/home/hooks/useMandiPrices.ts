// Loads daily mandi prices scoped to the user's selected location. Tries the
// most specific scope first and widens on empty results so the ticker always
// shows the most relevant real data it can: district → state → nationwide. On a
// total failure it returns an empty list, and the ticker falls back to its
// curated prices.
import { useEffect, useState } from 'react';

import { logger } from '@/lib';
import { useAppSelector } from '@/store/hooks';
import { selectSelectedLocation } from '@/store/selectors';

import { getMandiPrices } from '../api/mandiApi';
import type { MandiPrice } from '../types';

// Result of the useMandiPrices hook.
export interface UseMandiPricesResult {
  // The loaded prices (empty until loaded, or on failure).
  prices: MandiPrice[];
  // How the prices are scoped, for a "showing X" label if desired.
  scope: 'district' | 'state' | 'national' | 'none';
  isLoading: boolean;
  isError: boolean;
}

// Loads mandi prices for the selected state / district.
export function useMandiPrices(): UseMandiPricesResult {
  const location = useAppSelector(selectSelectedLocation);
  const state = location?.state?.trim() || undefined;
  const district = location?.district?.trim() || undefined;

  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [scope, setScope] = useState<UseMandiPricesResult['scope']>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setIsError(false);

    (async () => {
      try {
        let data: MandiPrice[] = [];
        let resolved: UseMandiPricesResult['scope'] = 'none';

        // Most specific: this district within the state.
        if (state && district) {
          data = await getMandiPrices({ state, district, limit: 60 });
          if (data.length > 0) {
            resolved = 'district';
          }
        }
        // Widen to the whole state.
        if (data.length === 0 && state) {
          data = await getMandiPrices({ state, limit: 80 });
          if (data.length > 0) {
            resolved = 'state';
          }
        }
        // Last resort: a nationwide sample so the ticker still shows real data.
        if (data.length === 0) {
          data = await getMandiPrices({ limit: 80 });
          if (data.length > 0) {
            resolved = 'national';
          }
        }

        if (active) {
          setPrices(data);
          setScope(resolved);
          setIsLoading(false);
        }
      } catch (error) {
        logger.warn('[Mandi] price load failed', error);
        if (active) {
          setIsError(true);
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [state, district]);

  return { prices, scope, isLoading, isError };
}
