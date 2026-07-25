// Conversions between the address form, the API write payload, saved addresses,
// and resolved device-location / PIN-lookup results.
import type { PincodeResult, ResolvedPlace } from '@/features/location';

import type { AddressFormValues, AddressWritePayload, SavedAddress } from '../types';

// A blank address form.
export function emptyAddressForm(): AddressFormValues {
  return {
    label: '',
    fullAddress: '',
    country: '',
    state: '',
    district: '',
    city: '',
    village: '',
    pinCode: '',
    latitude: '',
    longitude: '',
    mobileNumber: '',
    altMobileNumber: '',
    isDefault: false,
  };
}

// Stringifies a value for the form, treating null/undefined as blank.
function str(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

// Pre-fills the form from a saved address.
export function savedToForm(address: SavedAddress): AddressFormValues {
  return {
    label: str(address.label),
    fullAddress: str(address.fullAddress),
    country: str(address.country),
    state: str(address.state),
    district: str(address.district),
    city: str(address.city),
    village: str(address.village),
    pinCode: str(address.pinCode),
    latitude: str(address.latitude),
    longitude: str(address.longitude),
    mobileNumber: str(address.mobileNumber),
    altMobileNumber: str(address.altMobileNumber),
    isDefault: Boolean(address.isDefault),
  };
}

// Trims a string, returning null when empty.
function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

// Parses a coordinate string to a number, or null when empty/invalid.
function coordinate(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

// Converts form values to the API write payload.
export function formToPayload(values: AddressFormValues): AddressWritePayload {
  return {
    label: nullable(values.label),
    fullAddress: nullable(values.fullAddress),
    country: nullable(values.country),
    state: nullable(values.state),
    district: nullable(values.district),
    city: nullable(values.city),
    village: nullable(values.village),
    pinCode: nullable(values.pinCode),
    latitude: coordinate(values.latitude),
    longitude: coordinate(values.longitude),
    mobileNumber: nullable(values.mobileNumber),
    altMobileNumber: nullable(values.altMobileNumber),
    isDefault: values.isDefault,
  };
}

// Overlays a resolved device place onto the form (non-empty place fields win).
export function mergePlace(
  values: AddressFormValues,
  place: ResolvedPlace,
): AddressFormValues {
  const next = { ...values };
  // Only the string-valued place fields map straight onto the form.
  const keys: Array<
    'village' | 'district' | 'city' | 'state' | 'country' | 'pinCode'
  > = ['village', 'district', 'city', 'state', 'country', 'pinCode'];
  for (const key of keys) {
    if (place[key]) {
      next[key] = place[key];
    }
  }
  if (place.fullAddress && !next.fullAddress) {
    next.fullAddress = place.fullAddress;
  }
  if (place.latitude != null) {
    next.latitude = String(place.latitude);
  }
  if (place.longitude != null) {
    next.longitude = String(place.longitude);
  }
  return next;
}

// Overlays a PIN-code lookup result onto the form.
export function mergePincode(
  values: AddressFormValues,
  result: PincodeResult,
): AddressFormValues {
  return {
    ...values,
    pinCode: result.pinCode,
    district: result.district || values.district,
    city: result.city || values.city,
    state: result.state || values.state,
    country: result.country || values.country,
  };
}

// Builds a one-line summary of a saved address for the card.
export function addressSummary(address: SavedAddress): string {
  return [
    address.fullAddress,
    address.village,
    address.city,
    address.district,
    address.state,
    address.pinCode,
  ]
    .map((part) => (part ? String(part).trim() : ''))
    .filter((part) => part !== '')
    .join(', ');
}
