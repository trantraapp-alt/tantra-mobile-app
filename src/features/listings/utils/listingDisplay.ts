// Presentation helpers for listings: id/image resolution, status → badge tone,
// and deriving a human title from the category form metadata.
//
// Listings have no `title` column: they store neutral attribute values (e.g.
// `cropName: "wheat"`). The readable, localized name comes from the form
// schema's option labels, so the card title is resolved via metadata.
import type { BadgeTone } from '@/components/ui';
import { fileUrl } from '@/config';
import { type ListingField, type ListingForm, localize } from '@/features/sell';
import type { PreferredLanguage } from '@/types';

import type { ListingImage, ListingStatus, MyListing } from '../types';

// Field keys that most likely hold the listing's descriptive name.
const NAME_HINT = /name|title|variety|breed|model|brand/i;
// Field types eligible to act as the listing title.
const TITLE_TYPES: string[] = ['DROPDOWN', 'RADIO', 'TEXT'];

// Returns the listing's id as an opaque string, preferring the API's
// `listingId` and falling back to `id`. Returns '' when the payload carries
// neither, which callers treat as "no id".
//
// Deliberately NOT Number()-coerced: a non-numeric id (a UUID, a prefixed
// reference such as "LST-1042") would become NaN -> 0, which would hide the
// reference chip and route every tap to /listings/0.
export function getListingId(listing: MyListing): string {
  for (const candidate of [listing.listingId, listing.id]) {
    if (candidate === null || candidate === undefined) {
      continue;
    }
    const value = String(candidate).trim();
    if (value !== '' && value !== '0') {
      return value;
    }
  }
  return '';
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

// Reads a field's stored value: common fields are top-level, category-specific
// fields live under `attributes`.
export function readFieldValue(
  listing: MyListing,
  field: ListingField,
): unknown {
  return field.common
    ? listing[field.fieldKey]
    : listing.attributes?.[field.fieldKey];
}

// Whether a stored value is present and non-empty. `false` and `0` are filled
// values — a falsy check here would silently delete every "No" answer and every
// zero quantity from the detail screen.
export function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

// Resolves a stored dropdown/radio value to its localized label using the
// field's option list; falls back to the raw value.
export function resolveOptionLabel(
  field: ListingField,
  value: string,
  language: PreferredLanguage,
): string {
  const option = field.options?.find((item) => item.value === value);
  return option ? localize(option.label, language) : value;
}

// Picks the field whose value acts as the listing's descriptive name. Exported
// so the detail screen can hide the exact field that became the page heading
// instead of re-guessing it with a second copy of this heuristic.
export function resolveTitleField(
  listing: MyListing,
  form: ListingForm | undefined,
): ListingField | undefined {
  if (!form) {
    return undefined;
  }
  const candidates = form.sections
    .flatMap((section) => section.fields)
    .filter(
      (field) =>
        TITLE_TYPES.includes(field.type) &&
        isFilled(readFieldValue(listing, field)),
    )
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    candidates.find((field) => NAME_HINT.test(field.fieldKey)) ??
    candidates.find(
      (field) => field.type === 'DROPDOWN' || field.type === 'RADIO',
    ) ??
    candidates[0]
  );
}

// Derives a readable listing title: an explicit title if the API sends one,
// otherwise the listing's primary descriptive field resolved through the form
// metadata, then the category/form name, then the caller's "untitled" label.
// The fallback deliberately avoids the id — the card already shows it in its
// own reference chip directly below the name.
export function deriveListingTitle(
  listing: MyListing,
  form: ListingForm | undefined,
  language: PreferredLanguage,
  untitledLabel: string,
): string {
  const { title, categoryName } = listing;
  if (title) {
    return typeof title === 'string' ? title : localize(title, language);
  }

  const primary = resolveTitleField(listing, form);
  if (primary) {
    const raw = readFieldValue(listing, primary);
    const value = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw);
    const label = resolveOptionLabel(primary, value, language);
    if (label.trim() !== '') {
      return label;
    }
  }

  if (categoryName) {
    return typeof categoryName === 'string'
      ? categoryName
      : localize(categoryName, language);
  }
  if (form) {
    return localize(form.title, language);
  }
  return untitledLabel;
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
