// DTOs for the backend wishlist feature (/api/v1/wishlist).
import type { FeedListing } from '@/features/home/types';

// A single wishlist entry. `listing` is null when the seller deleted the
// listing after it was saved (show a "no longer available" placeholder).
export interface WishlistItem {
  listingId: string;
  savedAt: string;
  listing: FeedListing | null;
}

// The wishlisted state of a single listing.
export interface WishlistStatus {
  listingId: string;
  wishlisted: boolean;
}

// The localized message returned by add / remove.
export interface WishlistMessage {
  en: string;
  hi: string;
}
