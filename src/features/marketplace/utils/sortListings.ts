// Client-side ordering for listing results. The browse/category endpoints
// currently 500 on the backend Spring `sort` param, so ordering is applied here
// on the loaded results. RELEVANCE (and unknown values) keep the backend order.
import type { FeedListing } from '@/features/home';

import type { ListingSort } from '../types';

// Comparable offered price (falls back to the actual price, then 0).
function priceOf(listing: FeedListing): number {
  return listing.offeredPrice ?? listing.actualPrice ?? 0;
}

// Creation time as a sortable number (0 when missing / unparseable).
function timeOf(listing: FeedListing): number {
  return listing.createdAt ? Date.parse(listing.createdAt) || 0 : 0;
}

// Returns a new array of listings ordered by the given sort option.
export function sortListings(
  listings: FeedListing[],
  sort: ListingSort | undefined,
): FeedListing[] {
  switch (sort) {
    case 'PRICE_ASC':
      return [...listings].sort((a, b) => priceOf(a) - priceOf(b));
    case 'PRICE_DESC':
      return [...listings].sort((a, b) => priceOf(b) - priceOf(a));
    case 'NEWEST':
      return [...listings].sort((a, b) => timeOf(b) - timeOf(a));
    default:
      return listings;
  }
}
