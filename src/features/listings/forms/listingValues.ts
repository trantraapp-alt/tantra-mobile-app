// Converts an existing listing into form values for the edit form, and builds
// partial (PATCH) payloads for inline edits — the inverse of buildListingPayload.
import {
  type AddressValue,
  coerceFieldValue,
  emptyAddress,
  type ListingField,
  type ListingForm,
  type ListingValues,
} from '@/features/sell';

import type { MyListing } from '../types';
import { imageToUrl } from '../utils/listingDisplay';

// Flattens every field across all sections.
function flattenFields(form: ListingForm): ListingField[] {
  return form.sections.flatMap((section) => section.fields);
}

// Stringifies a raw value for a text-like form control.
function str(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

// Rebuilds an address form value from the API address object.
function addressValueFromApi(raw: unknown): AddressValue {
  const base = emptyAddress();
  if (!raw || typeof raw !== 'object') {
    return base;
  }
  const src = raw as Record<string, unknown>;
  (Object.keys(base) as (keyof AddressValue)[]).forEach((key) => {
    if (src[key] !== undefined && src[key] !== null) {
      base[key] = str(src[key]);
    }
  });
  return base;
}

// Maps a stored listing value to the form-state value for a field type.
function toFormValue(
  field: ListingField,
  raw: unknown,
): string | boolean | string[] | AddressValue {
  switch (field.type) {
    case 'IMAGE':
      return Array.isArray(raw) ? raw.map(imageToUrl).filter(Boolean) : [];
    case 'CHECKBOX_GROUP':
      return Array.isArray(raw) ? raw.map(str) : [];
    case 'BOOLEAN':
      return Boolean(raw);
    case 'ADDRESS':
      return addressValueFromApi(raw);
    default:
      return str(raw);
  }
}

// Builds pre-filled form values from an existing listing. Common fields come
// from the listing top-level; category fields from `attributes`.
export function listingToFormValues(
  form: ListingForm,
  listing: MyListing,
): ListingValues {
  const values: ListingValues = {};
  for (const section of form.sections) {
    for (const field of section.fields) {
      if (field.type === 'AUTO_CALC') {
        continue;
      }
      let raw: unknown;
      if (field.type === 'IMAGE') {
        raw = listing.images;
      } else if (field.type === 'ADDRESS') {
        raw = listing.address;
      } else if (field.common) {
        raw = listing[field.fieldKey];
      } else {
        raw = listing.attributes?.[field.fieldKey];
      }
      values[field.fieldKey] = toFormValue(field, raw);
    }
  }
  return values;
}

// The fields eligible for on-card inline editing (simple, flagged, non-media).
export function inlineEditableFields(form: ListingForm): ListingField[] {
  return flattenFields(form).filter(
    (field) =>
      field.inlineEditable === true &&
      field.type !== 'IMAGE' &&
      field.type !== 'ADDRESS' &&
      field.type !== 'AUTO_CALC',
  );
}

// Builds a partial PATCH body containing only the changed inline fields. Common
// fields go top-level; category fields under `attributes`.
export function buildInlinePatch(
  form: ListingForm,
  changedKeys: string[],
  values: ListingValues,
): Record<string, unknown> {
  const byKey = new Map(flattenFields(form).map((field) => [field.fieldKey, field]));
  const patch: Record<string, unknown> = {};
  const attributes: Record<string, unknown> = {};

  for (const key of changedKeys) {
    const field = byKey.get(key);
    if (!field) {
      continue;
    }
    const value = coerceFieldValue(field, values[key]);
    if (value === undefined) {
      continue;
    }
    if (field.common) {
      patch[key] = value;
    } else {
      attributes[key] = value;
    }
  }

  if (Object.keys(attributes).length > 0) {
    patch.attributes = attributes;
  }
  return patch;
}
