// Presentation helpers for listings: id/image/title resolution and status →
// badge tone mapping.
import type { BadgeTone } from '@/components/ui';
import { fileUrl } from '@/config';
import { localize } from '@/features/sell';
import type { PreferredLanguage } from '@/types';

import type { ListingImage, ListingStatus, MyListing } from '../types';

// Returns a listing's numeric id, tolerating either `listingId` or `id`.
export function getListingId(listing: MyListing): number {
  return listing.listingId ?? listing.id ?? 0;
}

// Extracts the relative URL string from an image entry.
export function imageToUrl(image: ListingImage): string {
  return typeof image === 'string' ? image : image.url;
}

// The absolute URL of the listing's first image, ready for <Image>.
export function firstImageUri(listing: MyListing): string | undefined {
  const first = listing.images?.[0];
  if (!first) {
    return undefined;
  }
  return fileUrl(imageToUrl(first));
}

// Resolves a human title for the card: explicit title, else category name,
// else a generic fallback with the id.
export function resolveListingTitle(
  listing: MyListing,
  language: PreferredLanguage,
): string {
  const { title, categoryName } = listing;
  if (title) {
    return typeof title === 'string' ? title : localize(title, language);
  }
  if (categoryName) {
    return typeof categoryName === 'string'
      ? categoryName
      : localize(categoryName, language);
  }
  return `Listing #${getListingId(listing)}`;
}

// Maps a listing status to a Badge tone.
export function statusTone(status: string): BadgeTone {
  switch (status as ListingStatus) {
    case 'ACTIVE':
      return 'success';
    case 'SOLD':
      return 'primary';
    case 'INACTIVE':
      return 'neutral';
    default:
      return 'neutral';
  }
}
