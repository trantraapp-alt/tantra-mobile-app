// Adapts a seller's own listing (`MyListing`) to the public `FeedListing` shape
// the shared detail body renders, so the preview and the buyer page are the same
// screen reading the same contract — one place to change when either moves.
//
// The two models already agree on almost everything (both keep category-specific
// answers under `attributes` and common fields top-level); the differences worth
// naming are:
//   • images arrive as bare strings OR `{ url }` objects, and the body expects
//     plain relative paths it can resolve itself;
//   • the address is an untyped record here and a typed `FeedAddress` there;
//   • seller identity fields do not exist — the preview hides the seller card,
//     since describing the viewer to themselves says nothing.
import type { FeedAddress, FeedListing } from '@/features/home';

import type { MyListing } from '../types';
import { getListingId, imageToUrl } from './listingDisplay';

// Reads a string field off the loosely-typed stored address.
function addressText(
  address: Record<string, unknown> | null | undefined,
  key: string,
): string | undefined {
  const value = address?.[key];
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return undefined;
}

// Maps the stored address record onto the typed address the body reads. Both
// `pincode` and `pinCode` spellings are accepted — the write path has used both.
function toFeedAddress(
  address: Record<string, unknown> | null | undefined,
): FeedAddress | null {
  if (!address || typeof address !== 'object') {
    return null;
  }
  const mapped: FeedAddress = {
    village: addressText(address, 'village') ?? null,
    district: addressText(address, 'district') ?? null,
    state: addressText(address, 'state') ?? null,
    pincode:
      addressText(address, 'pincode') ?? addressText(address, 'pinCode') ?? null,
    city: addressText(address, 'city') ?? null,
    country: addressText(address, 'country') ?? null,
    fullAddress: addressText(address, 'fullAddress') ?? null,
    latitude: addressText(address, 'latitude') ?? null,
    longitude: addressText(address, 'longitude') ?? null,
  };
  return Object.values(mapped).some((part) => part != null && part !== '')
    ? mapped
    : null;
}

// Converts the seller's listing into the shape the shared detail body reads.
export function listingToFeed(listing: MyListing): FeedListing {
  const images = (listing.images ?? [])
    .map(imageToUrl)
    .filter((url): url is string => typeof url === 'string' && url.trim() !== '');

  return {
    // Spread first so every common field the form schema may ask for (price,
    // quantity, unit, isNegotiable, custom top-level keys) survives the trip —
    // the body reads those by their schema `fieldKey`, not from this list.
    ...(listing as Record<string, unknown>),
    listingId: getListingId(listing),
    userId: listing.userId == null ? undefined : String(listing.userId),
    categoryId: listing.categoryId,
    categoryName: listing.categoryName ?? null,
    title: listing.title ?? null,
    listingType: String(listing.listingType),
    status: String(listing.status),
    images,
    address: toFeedAddress(listing.address),
    attributes: listing.attributes ?? null,
    createdAt: listing.createdAt,
  } as FeedListing;
}
