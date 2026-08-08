// Repository for the backend-driven "Today's Deals": the card strip and the
// paginated listings behind a deal group. The `lang` param is injected globally
// by the http client; the standard envelope is unwrapped by its interceptor.
import { endpoints } from '@/config';
import type { FeedListing } from '@/features/home';
import type { GeoPoint, MarketplacePage } from '@/features/marketplace';
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

// Fetches one page of listings behind a deal group. Returns EVERY listing in the
// group (no radius cutoff); when GPS is available the backend sorts them
// nearest-first (and returns distanceKm), otherwise price-ascending. Paginated.
export function getDealListings(
  groupKey: string,
  geo: GeoPoint | undefined,
  page: number,
  size: number,
): Promise<MarketplacePage<FeedListing>> {
  return apiClient.get<MarketplacePage<FeedListing>>(
    endpoints.deals.listings(groupKey),
    { params: { ...geoParams(geo), page, size } },
  );
}
