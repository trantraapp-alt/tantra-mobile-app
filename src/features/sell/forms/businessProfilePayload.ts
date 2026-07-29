// Builds the create-business-profile request body from the schema + collected
// values. Mirrors the listing payload split: a few identity fields go top-level
// (with the address handled the same way), everything else goes under
// `attributes`. Reuses the shared field coercion so the two flows stay in sync.
import {
  type AddressSelection,
  addressToPayload,
  hasAddressValue,
  isAddressSelection,
  isAddressValue,
} from './address';
import type { ListingForm } from './listingForm.types';
import { coerceFieldValue, type ListingValues } from './listingPayload';

// Field keys sent at the top level of a business profile (not under attributes).
const TOP_LEVEL_KEYS = new Set(['businessName', 'isVisible']);

// Create-business-profile request payload.
export interface CreateBusinessProfilePayload {
  // Which profile the form belongs to (the category's linkKey, e.g. vet_clinic).
  profileType: string;
  // Id of a saved address to snapshot onto the profile.
  addressId?: string;
  // When true, snapshot the user's default address.
  useDefaultAddress?: boolean;
  // A raw structured address (when the address book is not used).
  address?: Record<string, unknown>;
  // Profile-specific field values keyed by field key.
  attributes: Record<string, unknown>;
  // Other top-level fields (businessName, isVisible, …).
  [key: string]: unknown;
}

// Applies an ADDRESS field's value onto the top-level payload (saved id, the
// default flag, or a raw address) — the same rules the listing payload uses.
function applyAddress(
  target: Record<string, unknown>,
  raw: AddressSelection | unknown,
): void {
  if (isAddressSelection(raw)) {
    if (raw.mode === 'default') {
      target.useDefaultAddress = true;
    } else if (raw.mode === 'saved') {
      target.addressId = raw.addressId;
    } else {
      const address = addressToPayload(raw.value);
      if (hasAddressValue(address)) {
        target.address = address;
      }
    }
    return;
  }
  if (isAddressValue(raw)) {
    const address = addressToPayload(raw);
    if (hasAddressValue(address)) {
      target.address = address;
    }
  }
}

// Assembles the create-business-profile payload from a form schema and values.
export function buildBusinessProfilePayload(
  form: ListingForm,
  values: ListingValues,
  profileType: string,
): CreateBusinessProfilePayload {
  const top: Record<string, unknown> = {};
  const attributes: Record<string, unknown> = {};

  for (const section of form.sections) {
    for (const field of section.fields) {
      if (field.type === 'ADDRESS') {
        applyAddress(top, values[field.fieldKey]);
        continue;
      }
      const value = coerceFieldValue(field, values[field.fieldKey]);
      if (value === undefined) {
        continue;
      }
      if (TOP_LEVEL_KEYS.has(field.fieldKey)) {
        top[field.fieldKey] = value;
      } else {
        attributes[field.fieldKey] = value;
      }
    }
  }

  return { profileType, ...top, attributes };
}
