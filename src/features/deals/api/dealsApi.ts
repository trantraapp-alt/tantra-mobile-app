// Repository for the backend-driven "Fresh Deals" cards. The `lang` param is
// injected globally by the http client; the standard envelope is unwrapped by
// its interceptor. (The listings behind a deal group are fetched via
// marketplaceApi.browseDealGroup, so they share the browse filter/sort machinery.)
import { endpoints } from '@/config';
import type { GeoPoint } from '@/features/marketplace';
import { apiClient } from '@/lib';

import type { DealCard } from '../types';

// GPS query params, dropped when the location is unknown.
function geoParams(geo: GeoPoint | undefined): Record<string, number> {
  return geo ? { lat: geo.lat, lng: geo.lng } : {};
}

// Fetches the deal cards for the user's location (empty array when none).
export function getDeals(geo: GeoPoint | undefined): Promise<DealCard[]> {
  return apiClient.get<DealCard[]>(endpoints.deals.list, {
    params: geoParams(geo),
  });
}
