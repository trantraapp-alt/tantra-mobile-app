// Repository layer for buyer marketplace reads: unified search, browse by
// category, nearby, listings by seller, and contact reveal. The `lang` param is
// injected globally by the http client.
import { endpoints } from '@/config';
import type { FeedListing } from '@/features/home';
import { apiClient } from '@/lib';

import type {
  ContactRevealResult,
  GeoPoint,
  ListingFilters,
  MarketplacePage,
  SearchResult,
} from '../types';

// A query param bag with empties already dropped.
type Params = Record<string, string | number>;

// Maps our sort model to Spring's `sort` query value (relevance / nearest are
// server-ordered and carry no explicit sort).
const SPRING_SORT: Record<string, string> = {
  NEWEST: 'createdAt,desc',
  PRICE_ASC: 'offeredPrice,asc',
  PRICE_DESC: 'offeredPrice,desc',
};

// True for a usable numeric filter value.
function isNum(value: number | undefined | null): value is number {
  return value != null && !Number.isNaN(value);
}

// Builds the shared query params from filters, an optional GPS point and paging.
function baseParams(
  filters: ListingFilters,
  geo: GeoPoint | undefined,
  page: number,
  size: number,
): Params {
  const params: Params = { page, size };
  if (filters.moduleId != null) {
    params.moduleId = filters.moduleId;
  }
  if (filters.listingType) {
    params.listingType = filters.listingType;
  }
  if (isNum(filters.minPrice)) {
    params.minPrice = filters.minPrice;
  }
  if (isNum(filters.maxPrice)) {
    params.maxPrice = filters.maxPrice;
  }
  if (filters.district && filters.district.trim()) {
    params.district = filters.district.trim();
  }
  if (filters.state && filters.state.trim()) {
    params.state = filters.state.trim();
  }
  if (isNum(filters.radius)) {
    params.radius = filters.radius;
  }
  if (filters.sellerType && filters.sellerType !== 'ALL') {
    params.sellerType = filters.sellerType;
  }
  if (filters.postedWithin && filters.postedWithin !== 'ALL') {
    params.postedWithin = filters.postedWithin;
  }
  // Category-specific attribute filters go out prefixed with `attr_`.
  if (filters.attributes) {
    for (const [key, value] of Object.entries(filters.attributes)) {
      if (value) {
        params[`attr_${key}`] = value;
      }
    }
  }
  if (geo) {
    params.lat = geo.lat;
    params.lng = geo.lng;
  }
  return params;
}

// Applies a Spring `sort` param when the filter carries a sortable option.
function withSort(params: Params, filters: ListingFilters): Params {
  const sort = filters.sort ? SPRING_SORT[filters.sort] : undefined;
  if (sort) {
    params.sort = sort;
  }
  return params;
}

// Unified search across listings and business profiles.
function search(
  query: string,
  filters: ListingFilters,
  geo: GeoPoint | undefined,
  page: number,
  size: number,
): Promise<SearchResult> {
  const params = baseParams(filters, geo, page, size);
  if (query.trim()) {
    params.q = query.trim();
  }
  return apiClient.get<SearchResult>(endpoints.search.query, { params });
}

// Public listings within a category.
function browseCategory(
  categoryId: number,
  filters: ListingFilters,
  geo: GeoPoint | undefined,
  page: number,
  size: number,
  query?: string,
): Promise<MarketplacePage<FeedListing>> {
  // No explicit `sort` — the backend 500s on the Spring sort param here, and the
  // working /search endpoint sends none either. Backend orders these by default.
  const params = baseParams(filters, geo, page, size);
  if (query && query.trim()) {
    params.q = query.trim();
  }
  return apiClient.get<MarketplacePage<FeedListing>>(
    endpoints.listings.category(categoryId),
    { params },
  );
}

// Public listings for a category key (crop/seed/equipment…), used by the
// DB-driven carousel. No explicit `sort` (the backend 500s on the Spring sort
// param; /search omits it too) — the backend applies its default ordering.
function browseByKey(
  categoryKey: string,
  filters: ListingFilters,
  geo: GeoPoint | undefined,
  page: number,
  size: number,
  query?: string,
): Promise<MarketplacePage<FeedListing>> {
  const params = baseParams(filters, geo, page, size);
  if (query && query.trim()) {
    params.q = query.trim();
  }
  return apiClient.get<MarketplacePage<FeedListing>>(
    endpoints.listings.browseByKey(categoryKey),
    { params },
  );
}

// Public listings behind a "Fresh Deals" group (groupKey = deal card ctaValue),
// filtered / paginated like a category browse. Every listing in the group is
// returned; with geo the backend sorts nearest-first. No explicit `sort` param
// (the browse endpoints 500 on it) — order client-side via sortListings().
function browseDealGroup(
  groupKey: string,
  filters: ListingFilters,
  geo: GeoPoint | undefined,
  page: number,
  size: number,
  query?: string,
): Promise<MarketplacePage<FeedListing>> {
  const params = baseParams(filters, geo, page, size);
  if (query && query.trim()) {
    params.q = query.trim();
  }
  return apiClient.get<MarketplacePage<FeedListing>>(
    endpoints.deals.listings(groupKey),
    { params },
  );
}

// Listings sorted closest-first around a GPS point (requires `geo`).
function nearby(
  filters: ListingFilters,
  geo: GeoPoint,
  page: number,
  size: number,
  query?: string,
): Promise<MarketplacePage<FeedListing>> {
  const params = baseParams(filters, geo, page, size);
  if (query && query.trim()) {
    params.q = query.trim();
  }
  return apiClient.get<MarketplacePage<FeedListing>>(endpoints.listings.nearby, {
    params,
  });
}

// All active listings by a given seller.
function bySeller(
  userId: string,
  filters: ListingFilters,
  page: number,
  size: number,
  query?: string,
): Promise<MarketplacePage<FeedListing>> {
  const params = withSort(baseParams(filters, undefined, page, size), filters);
  if (query && query.trim()) {
    params.q = query.trim();
  }
  return apiClient.get<MarketplacePage<FeedListing>>(
    endpoints.listings.bySeller(userId),
    { params },
  );
}

// A single listing's full detail.
function getListingDetail(listingId: string): Promise<FeedListing> {
  return apiClient.get<FeedListing>(endpoints.listings.detail(listingId));
}

// Up to `limit` similar listings from the same category.
function getSimilar(listingId: string, limit = 6): Promise<FeedListing[]> {
  return apiClient.get<FeedListing[]>(endpoints.listings.similar(listingId), {
    params: { limit },
  });
}

// Reveals the seller's phone number for a listing (auth required).
function revealContact(listingId: string): Promise<ContactRevealResult> {
  return apiClient.post<ContactRevealResult>(
    endpoints.listings.contact(listingId),
  );
}

// Marketplace repository.
export const marketplaceApi = {
  search,
  browseCategory,
  browseByKey,
  browseDealGroup,
  nearby,
  bySeller,
  getListingDetail,
  getSimilar,
  revealContact,
} as const;
