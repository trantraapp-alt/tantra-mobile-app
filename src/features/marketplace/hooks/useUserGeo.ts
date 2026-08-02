// Derives a stable GPS point from the user's selected location, or undefined
// when no coordinates are known. Memoized so it can be a dependency without
// retriggering fetches every render.
import { useMemo } from 'react';

import { useAppSelector } from '@/store/hooks';
import { selectSelectedLocation } from '@/store/selectors';

import type { GeoPoint } from '../types';

// Returns the user's GPS point, or undefined when unset.
export function useUserGeo(): GeoPoint | undefined {
  const location = useAppSelector(selectSelectedLocation);
  const lat = location?.latitude ?? null;
  const lng = location?.longitude ?? null;
  return useMemo(
    () => (lat != null && lng != null ? { lat, lng } : undefined),
    [lat, lng],
  );
}
