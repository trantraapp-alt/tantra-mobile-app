// Types describing a seller's own marketplace listings and the paginated
// responses / write results returned by the listings API.
import type { LocalizedText } from '@/features/sell';

// Whether a listing is offered for sale or for rent.
export type ListingType = 'SELL' | 'RENT';

// Lifecycle status of a listing.
export type ListingStatus = 'ACTIVE' | 'SOLD' | 'INACTIVE';

// Status filter value used by the My Listings screen (`ALL` = no filter).
export type ListingStatusFilter = 'ALL' | ListingStatus;

// A listing image as returned by the API — either a bare relative URL string or
// an object wrapping one.
export type ListingImage = string | { url: string };

// A listing owned by the current user. Category-specific values live under
// `attributes`; common fields (price, images, address, status…) are top-level.
// The index signature lets common fields be read by their schema `fieldKey`.
export interface MyListing {
  // Primary identifier (the API may expose it as `listingId` or `id`).
  listingId?: number;
  id?: number;
  // Owning user.
  userId?: number;
  // Category the listing belongs to (drives its form schema).
  categoryId: number;
  // Localized category name, when the API includes it.
  categoryName?: LocalizedText | string;
  // Sale or rent.
  listingType: ListingType | string;
  // Lifecycle status.
  status: ListingStatus | string;
  // Optional display title.
  title?: LocalizedText | string | null;
  // Asking price.
  offeredPrice?: number | null;
  // Original / compare-at price (struck through on the card).
  actualPrice?: number | null;
  // Computed discount percentage.
  discountPct?: number | null;
  // Available quantity.
  quantity?: number | null;
  // Image URLs (relative `/files/..` paths or `{ url }` objects).
  images?: ListingImage[] | null;
  // Structured address.
  address?: Record<string, unknown> | null;
  // Category-specific field values keyed by field key.
  attributes?: Record<string, unknown> | null;
  // Timestamps.
  createdAt?: string;
  updatedAt?: string;
  // Any other common top-level field values.
  [key: string]: unknown;
}

// A Spring-style page envelope returned by paginated list endpoints.
export interface ListingPage<T> {
  // Items on the current page.
  content: T[];
  // Total number of pages.
  totalPages: number;
  // Total number of elements across all pages.
  totalElements: number;
  // Zero-based index of the current page.
  number: number;
  // Page size.
  size: number;
  // Whether this is the last page.
  last: boolean;
  // Whether this is the first page.
  first: boolean;
}

// Standard response shape for listing write operations (create/update/patch/
// delete). `message` is bilingual and shown to the user in their language.
export interface ListingWriteResponse {
  // Whether the operation succeeded.
  success: boolean;
  // The affected listing id.
  listingId: number;
  // The owning user id.
  userId?: number;
  // Bilingual result message.
  message?: LocalizedText;
}
