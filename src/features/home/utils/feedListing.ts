// Presentation helpers shared by the home-feed cards: image/URL resolution, a
// short locality label, distance formatting, and a resilient display title
// derived from a listing's title / attributes / category name.
import { fileUrl } from '@/config';
import { localize, type LocalizedText } from '@/features/sell';
import type { PreferredLanguage } from '@/types';

import type { FeaturedBusiness, FeedAddress, FeedListing } from '../types';

// The listing reference as a string ('' when missing).
export function feedListingId(listing: FeedListing): string {
  return listing.listingId == null ? '' : String(listing.listingId).trim();
}

// Resolves a stored image path/URL to an absolute, servable URL.
function resolveImage(value: string | undefined): string | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }
  return fileUrl(value.trim());
}

// The first (thumbnail) image of a listing, absolute — or undefined.
export function firstFeedImage(listing: FeedListing): string | undefined {
  return resolveImage((listing.images ?? [])[0]);
}

// All listing images, absolute, with blanks dropped.
export function feedImages(listing: FeedListing): string[] {
  return (listing.images ?? [])
    .map(resolveImage)
    .filter((uri): uri is string => Boolean(uri));
}

// A compact one-line locality label ("Village, District" or "District, State").
export function feedLocationLabel(
  address: FeedAddress | null | undefined,
): string {
  if (!address) {
    return '';
  }
  const parts = [address.village, address.district, address.state]
    .map((part) => (part ?? '').trim())
    .filter(Boolean);
  return parts.slice(0, 2).join(', ');
}

// A rounded distance chip label ("3.2 km"), or undefined when no GPS distance.
export function formatDistanceKm(
  distanceKm: number | null | undefined,
): string | undefined {
  if (distanceKm == null || Number.isNaN(distanceKm)) {
    return undefined;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// Reads a value that may be a bilingual pair or a plain string.
function readLocalized(
  value: LocalizedText | string | null | undefined,
  language: PreferredLanguage,
): string {
  if (!value) {
    return '';
  }
  return (typeof value === 'string' ? value : localize(value, language)).trim();
}

// Attribute keys that commonly hold a human-readable name for the item.
const TITLE_ATTRIBUTE_KEYS = [
  'title',
  'name',
  'productName',
  'cropName',
  'variety',
  'breed',
  'model',
  'itemName',
];

// A best-effort display title: explicit title → a naming attribute → category
// name → the provided fallback. Never returns an empty string.
export function resolveFeedTitle(
  listing: FeedListing,
  language: PreferredLanguage,
  fallback: string,
): string {
  const direct = readLocalized(listing.title, language);
  if (direct) {
    return direct;
  }
  const attributes = listing.attributes ?? {};
  for (const key of TITLE_ATTRIBUTE_KEYS) {
    const raw = attributes[key];
    if (typeof raw === 'string' && raw.trim() !== '') {
      return raw.trim();
    }
  }
  const category = readLocalized(listing.categoryName, language);
  return category || fallback;
}

// Attribute keys whose value is a free-text description of the item.
const DESCRIPTION_KEY_RE = /description|details|about|remarks/i;

// A free-text description pulled from the listing's attributes (e.g.
// `cropDescription`), or undefined when none is present.
export function feedDescription(listing: FeedListing): string | undefined {
  const attributes = listing.attributes ?? {};
  for (const [key, value] of Object.entries(attributes)) {
    if (
      DESCRIPTION_KEY_RE.test(key) &&
      typeof value === 'string' &&
      value.trim() !== ''
    ) {
      return value.trim();
    }
  }
  return undefined;
}

// Turns a raw attribute key into a human label: "cropType" -> "Crop Type",
// "qty_measurement" -> "Qty Measurement".
export function humanizeAttributeKey(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Attribute keys already surfaced elsewhere (title / quantity), hidden from the
// generic attributes grid to avoid duplication.
const HIDDEN_ATTRIBUTE_KEYS = new Set(['title', 'qty', 'quantity']);

// Human-labelled attribute entries for the detail grid: drops object / blank
// values and the keys already shown as the title, description or quantity.
export function listingAttributeEntries(
  listing: FeedListing,
): { key: string; label: string; value: string }[] {
  const attributes = listing.attributes ?? {};
  return Object.entries(attributes)
    .filter(
      ([key, value]) =>
        value != null &&
        typeof value !== 'object' &&
        String(value).trim() !== '' &&
        !HIDDEN_ATTRIBUTE_KEYS.has(key) &&
        !DESCRIPTION_KEY_RE.test(key),
    )
    .map(([key, value]) => ({
      key,
      label: humanizeAttributeKey(key),
      value: String(value),
    }));
}

// Whether a listing has been sold (grey overlay + stamp on the card).
export function isSold(listing: FeedListing): boolean {
  return String(listing.status ?? '').toUpperCase() === 'SOLD';
}

// A validated highlight color when the listing is a highlighted premium tile.
export function highlightColorOf(
  entity: { isHighlighted?: boolean; highlightColor?: string | null },
): string | undefined {
  if (!entity.isHighlighted) {
    return undefined;
  }
  const color = (entity.highlightColor ?? '').trim();
  return color !== '' ? color : undefined;
}

// The seller/premium badge text for the active language, or undefined.
export function sellerBadgeText(
  badge: LocalizedText | null | undefined,
  language: PreferredLanguage,
): string | undefined {
  const text = readLocalized(badge, language);
  return text !== '' ? text : undefined;
}

// Attribute keys that may hold a business profile's cover image.
const BUSINESS_IMAGE_KEYS = ['photos', 'images', 'coverImage', 'logo', 'photo'];

// Pulls a `fileUrl` out of a value that may be a string, `{ fileUrl|url }`, or
// an array of either — the shapes the dynamic profile form stores images as.
function extractImage(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return resolveImage(value);
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = extractImage(entry);
      if (found) {
        return found;
      }
    }
    return undefined;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const candidate = record.fileUrl ?? record.url ?? record.uri;
    if (typeof candidate === 'string') {
      return resolveImage(candidate);
    }
  }
  return undefined;
}

// A featured business's display image: an explicit URL, else the first image
// found in its dynamic attributes.
export function businessImage(
  business: FeaturedBusiness,
): string | undefined {
  const direct = resolveImage(business.imageUrl ?? business.logoUrl ?? undefined);
  if (direct) {
    return direct;
  }
  const attributes = business.attributes ?? {};
  for (const key of BUSINESS_IMAGE_KEYS) {
    const found = extractImage(attributes[key]);
    if (found) {
      return found;
    }
  }
  return undefined;
}

// A featured business's location label.
export function businessLocationLabel(
  business: FeaturedBusiness,
  language: PreferredLanguage,
): string {
  const fromAddress = feedLocationLabel(business.address);
  if (fromAddress) {
    return fromAddress;
  }
  const parts = [business.district, business.state]
    .map((part) => (part ?? '').trim())
    .filter(Boolean);
  if (parts.length > 0) {
    return parts.join(', ');
  }
  return readLocalized(business.profileTypeLabel, language);
}
