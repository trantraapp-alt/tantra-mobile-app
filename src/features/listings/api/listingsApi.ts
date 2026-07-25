// Repository layer for the current user's listings: list, read, full update
// (PUT), inline update (PATCH) and soft delete (DELETE).
import { endpoints } from '@/config';
import type { CreateListingPayload } from '@/features/sell';
import { apiClient } from '@/lib';

import type {
  ListingId,
  ListingPage,
  ListingWriteResponse,
  MyListing,
} from '../types';

// Query parameters for the paginated "my listings" endpoint.
export interface GetMyListingsParams {
  // SELL or RENT.
  listingType?: string;
  // ACTIVE / SOLD / INACTIVE — omit for all statuses.
  status?: string;
  // Zero-based page index.
  page?: number;
  // Page size.
  size?: number;
}

// Drops undefined/empty values so we never send `status=undefined`.
function cleanParams(
  params: GetMyListingsParams,
): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      out[key] = value as string | number;
    }
  });
  return out;
}

// Fetches a page of the current user's listings.
function getMyListings(
  params: GetMyListingsParams,
): Promise<ListingPage<MyListing>> {
  return apiClient.get<ListingPage<MyListing>>(endpoints.listings.mine, {
    params: cleanParams(params),
  });
}

// Fetches a single listing with its current values.
function getListingById(id: ListingId): Promise<MyListing> {
  return apiClient.get<MyListing>(endpoints.listings.detail(id));
}

// Full update from the edit form. Locked fields sent in the body are ignored
// server-side.
function updateListing(
  id: ListingId,
  payload: CreateListingPayload,
): Promise<ListingWriteResponse> {
  return apiClient.put<ListingWriteResponse, CreateListingPayload>(
    endpoints.listings.detail(id),
    payload,
  );
}

// Inline update — sends only the changed field(s) or a status change. The
// backend applies only inline-editable fields and recomputes discount.
function patchListing(
  id: ListingId,
  patch: Record<string, unknown>,
): Promise<ListingWriteResponse> {
  return apiClient.patch<ListingWriteResponse, Record<string, unknown>>(
    endpoints.listings.detail(id),
    patch,
  );
}

// Soft-deletes a listing.
function deleteListing(id: ListingId): Promise<ListingWriteResponse> {
  return apiClient.remove<ListingWriteResponse>(endpoints.listings.detail(id));
}

// Listings repository.
export const listingsApi = {
  getMyListings,
  getListingById,
  updateListing,
  patchListing,
  deleteListing,
} as const;
