// Types for the buyer-facing marketplace: filters, paged results, unified search
// and contact reveal. Listing tiles reuse the home feed's FeedListing shape so
// the same FeedListingCard renders everywhere.
import type { FeaturedBusiness, FeedListing } from '@/features/home';

// Whether to browse items for sale or for rent.
export type MarketplaceListingType = 'SELL' | 'RENT';

// Seller audience filter — everyone, or premium subscribers only.
export type SellerType = 'ALL' | 'SUBSCRIBED';

// Freshness window for a listing.
export type PostedWithin = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';

// Sort options offered in the sort bar.
export type ListingSort =
  | 'RELEVANCE'
  | 'NEWEST'
  | 'PRICE_ASC'
  | 'PRICE_DESC'
  | 'NEAREST';

// Radius presets (km); `null` means "All India" (omit the radius param).
export type RadiusKm = 5 | 10 | 25 | 50 | 100 | null;

// The applied filter set shared by every list screen.
export interface ListingFilters {
  // Sale / rent (omit for both).
  listingType?: MarketplaceListingType;
  // Price bounds (applied to the offered price).
  minPrice?: number;
  maxPrice?: number;
  // Location text filters.
  district?: string;
  state?: string;
  // Distance radius in km (requires a GPS point to take effect).
  radius?: number;
  // Seller audience.
  sellerType?: SellerType;
  // Freshness window.
  postedWithin?: PostedWithin;
  // Result ordering.
  sort?: ListingSort;
  // Scopes results to a marketplace module (module browse). Sent as `moduleId`.
  moduleId?: number;
  // Category-specific attribute filters (attributeKey -> selected value), sent to
  // the listings API as `attr_{key}=value`. Populated from GET /filter-form.
  attributes?: Record<string, string>;
}

// A user's GPS point, used by distance-aware queries.
export interface GeoPoint {
  // Latitude.
  lat: number;
  // Longitude.
  lng: number;
}

// A Spring-style page envelope for listing lists.
export interface MarketplacePage<T> {
  // Items on this page.
  content: T[];
  // Total elements across all pages.
  totalElements?: number;
  // Total number of pages.
  totalPages?: number;
  // Current page index (Spring's `number`; some responses send `page`).
  number?: number;
  page?: number;
  // Page size.
  size?: number;
  // Whether this is the last page.
  last?: boolean;
  // Whether this is the first page.
  first?: boolean;
}

// The unified search response: matching listings + business profiles.
export interface SearchResult {
  // Total matching listings.
  totalListings?: number;
  // Total pages of listings.
  totalPages?: number;
  // Current page index.
  currentPage?: number;
  // Page size.
  pageSize?: number;
  // Echoed query.
  query?: string;
  // Matching listings.
  listings: FeedListing[];
  // Matching business profiles.
  businessProfiles: FeaturedBusiness[];
}

// What the reveal endpoint chose to expose, driven by the seller's
// `showContact` preference on the listing.
export type ContactRevealAction = 'REVEALED_FULL' | 'WHATSAPP_ONLY';

// Result of a contact reveal (POST /contacts/reveal/{listingId}).
export interface ContactRevealResult {
  // REVEALED_FULL ships the numbers; WHATSAPP_ONLY ships only the chat link.
  action: ContactRevealAction;
  // The seller's primary number — present only with REVEALED_FULL.
  mobileNumber?: string;
  // Optional secondary number; may be absent or null even on REVEALED_FULL.
  altMobileNumber?: string | null;
  // Prefilled wa.me deep link. Always sent — open it as-is, never rebuild it.
  whatsappUrl: string;
  // Title of the listing the reveal was for.
  listingTitle?: string;
  // False when the same buyer already revealed this listing within 24h.
  // Informational only: the backend dedupes silently.
  freshReveal?: boolean;
}
