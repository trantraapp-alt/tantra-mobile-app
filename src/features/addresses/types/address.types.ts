// Types for the address book: saved addresses, the create/update form values,
// geo option-set items, and the standard write response.
import type { LocalizedText } from '@/features/sell';

// A saved address returned by the backend.
export interface SavedAddress {
  // Stable id used in URLs and to select the address on a listing.
  addressId: string;
  // User label, e.g. "Farm" / "Home".
  label?: string | null;
  // Free-text address line.
  fullAddress?: string | null;
  // Country value (option-set value, e.g. "IN").
  country?: string | null;
  // State value.
  state?: string | null;
  // District value.
  district?: string | null;
  // City / town (free text).
  city?: string | null;
  // Village / locality (free text).
  village?: string | null;
  // PIN / postal code.
  pinCode?: string | null;
  // Latitude.
  latitude?: number | null;
  // Longitude.
  longitude?: number | null;
  // Primary mobile number.
  mobileNumber?: string | null;
  // Alternate mobile number.
  altMobileNumber?: string | null;
  // Whether this is the user's default address.
  isDefault?: boolean;
}

// Form state for creating / editing an address (all inputs are strings).
export interface AddressFormValues {
  // User label.
  label: string;
  // Free-text address line.
  fullAddress: string;
  // Country value.
  country: string;
  // State value.
  state: string;
  // District value.
  district: string;
  // City / town.
  city: string;
  // Village / locality.
  village: string;
  // PIN / postal code.
  pinCode: string;
  // Latitude (kept as text in the form).
  latitude: string;
  // Longitude (kept as text in the form).
  longitude: string;
  // Primary mobile number.
  mobileNumber: string;
  // Alternate mobile number.
  altMobileNumber: string;
  // Whether to make this the default address.
  isDefault: boolean;
}

// Request body for creating / updating an address (empty -> null, coords -> number).
export interface AddressWritePayload {
  label: string | null;
  fullAddress: string | null;
  country: string | null;
  state: string | null;
  district: string | null;
  city: string | null;
  village: string | null;
  pinCode: string | null;
  latitude: number | null;
  longitude: number | null;
  mobileNumber: string | null;
  altMobileNumber: string | null;
  isDefault: boolean;
}

// Standard write response for address mutations.
export interface AddressWriteResponse {
  // Whether the write succeeded (present on the compact shape).
  success?: boolean;
  // The affected address id.
  addressId: string;
  // Bilingual result message.
  message?: LocalizedText;
}

// A seeded geo option-set item (country / state / district).
export interface OptionSetItem {
  // Item id — the cascade key a child's `parentItemId` points to.
  itemId: number | string;
  // Stored value submitted for this item.
  value: string;
  // Bilingual display label.
  label: LocalizedText;
  // Parent item id for cascading sets (null for a root item).
  parentItemId?: number | string | null;
}
