// Builds the create-listing request body from the schema + collected values.
// Common fields (`common: true`) go top-level; the rest go under `attributes`.
// Values are coerced to their proper types and empty optionals are omitted.
import {
  type AddressSelection,
  addressToPayload,
  type AddressValue,
  hasAddressValue,
  isAddressSelection,
  isAddressValue,
} from './address';
import type { ListingField, ListingForm } from './listingForm.types';

// Raw form values keyed by field key (strings, booleans, image/checkbox lists,
// a structured address, or an address selection). Shared by the form renderer
// and update builders.
export type ListingValues = Record<
  string,
  string | boolean | string[] | AddressValue | AddressSelection
>;

// Create-listing request payload.
export interface CreateListingPayload {
  // Category the listing belongs to.
  categoryId: number;
  // Listing type, e.g. "SELL" or "BOTH".
  listingType: string;
  // Uploaded image URLs (common field).
  images?: string[];
  // Id of a saved address to snapshot onto the listing.
  addressId?: string;
  // When true, snapshot the user's default address.
  useDefaultAddress?: boolean;
  // A raw structured address (fallback when the address book is not used).
  address?: Record<string, unknown>;
  // Category-specific field values keyed by field key.
  attributes: Record<string, unknown>;
  // Other common fields (price, isNegotiable, etc.).
  [key: string]: unknown;
}

// Coerces a raw form value to its typed payload value, or undefined to omit.
// Exported so partial (PATCH) update builders can reuse the same coercion rules.
export function coerceFieldValue(field: ListingField, raw: unknown): unknown {
  switch (field.type) {
    case 'AUTO_CALC':
      return undefined;
    case 'BOOLEAN':
      return Boolean(raw);
    case 'IMAGE':
    case 'CHECKBOX_GROUP':
    case 'MULTISELECT':
      return Array.isArray(raw) && raw.length > 0 ? raw : undefined;
    case 'NUMBER':
    case 'DECIMAL': {
      const text = typeof raw === 'string' ? raw.trim() : '';
      if (text === '') {
        return undefined;
      }
      const parsed = Number(text);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    default: {
      const text = typeof raw === 'string' ? raw.trim() : '';
      return text === '' ? undefined : text;
    }
  }
}

// Assembles the create-listing payload from a form schema and its values.
export function buildListingPayload(
  form: ListingForm,
  values: ListingValues,
): CreateListingPayload {
  const common: Record<string, unknown> = {};
  const attributes: Record<string, unknown> = {};

  for (const section of form.sections) {
    for (const field of section.fields) {
      if (field.type === 'ADDRESS') {
        const raw = values[field.fieldKey];
        if (isAddressSelection(raw)) {
          if (raw.mode === 'default') {
            common.useDefaultAddress = true;
          } else if (raw.mode === 'saved') {
            common.addressId = raw.addressId;
          } else {
            const address = addressToPayload(raw.value);
            if (hasAddressValue(address)) {
              common.address = address;
            }
          }
        } else if (isAddressValue(raw)) {
          // Backward compatibility: a raw address value.
          const address = addressToPayload(raw);
          if (hasAddressValue(address)) {
            common.address = address;
          }
        }
        continue;
      }

      const value = coerceFieldValue(field, values[field.fieldKey]);
      if (value === undefined) {
        continue;
      }

      if (field.common) {
        common[field.fieldKey] = value;
      } else {
        attributes[field.fieldKey] = value;
      }
    }
  }

  return {
    categoryId: form.categoryId,
    listingType: form.listingType,
    ...common,
    attributes,
  };
}
