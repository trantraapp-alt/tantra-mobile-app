// Repository layer for the backend wishlist. The JWT is attached by the shared
// httpClient (no user id in the body) and the envelope is unwrapped, so these
// return payloads directly.
import { endpoints } from '@/config';
import { apiClient } from '@/lib';

import type { WishlistItem, WishlistMessage, WishlistStatus } from '../types';

// Adds a listing to the wishlist (idempotent on the backend).
function add(listingId: string): Promise<WishlistMessage> {
  return apiClient.post<WishlistMessage, undefined>(
    endpoints.wishlist.item(listingId),
    undefined,
  );
}

// Removes a listing from the wishlist.
function remove(listingId: string): Promise<WishlistMessage> {
  return apiClient.remove<WishlistMessage>(endpoints.wishlist.item(listingId));
}

// Lists all wishlist entries (newest saved first).
function getAll(): Promise<WishlistItem[]> {
  return apiClient.get<WishlistItem[]>(endpoints.wishlist.root);
}

// Reports whether a single listing is wishlisted.
function status(listingId: string): Promise<WishlistStatus> {
  return apiClient.get<WishlistStatus>(endpoints.wishlist.status(listingId));
}

// Wishlist repository.
export const wishlistApi = {
  add,
  remove,
  getAll,
  status,
} as const;
