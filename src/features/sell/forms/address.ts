// Structured address used by the ADDRESS field type. Stored in the form as an
// all-strings object; converted to the API shape (empty -> null, coords ->
// numbers) at submit time.

// Address value held in form state (every field is a string for the inputs).
export interface AddressValue {
  // Free-text address line.
  fullAddress: string;
  // Village.
  village: string;
  // District.
  district: string;
  // City.
  city: string;
  // State.
  state: string;
  // Country.
  country: string;
  // PIN / postal code.
  pinCode: string;
  // Primary mobile number.
  mobileNumber: string;
  // Alternate mobile number.
  altMobileNumber: string;
  // Latitude (kept as text in the form).
  latitude: string;
  // Longitude (kept as text in the form).
  longitude: string;
}

// The API address shape (empty fields are null; coordinates are numbers).
export interface AddressPayload {
  fullAddress: string | null;
  village: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pinCode: string | null;
  mobileNumber: string | null;
  altMobileNumber: string | null;
  latitude: number | null;
  longitude: number | null;
}

// Returns an empty address value with all fields blank.
export function emptyAddress(): AddressValue {
  return {
    fullAddress: '',
    village: '',
    district: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
    mobileNumber: '',
    altMobileNumber: '',
    latitude: '',
    longitude: '',
  };
}

// Narrows an unknown form value to an AddressValue.
export function isAddressValue(value: unknown): value is AddressValue {
  return (
    typeof value === 'object' && value !== null && 'fullAddress' in value
  );
}

// How a listing's address is chosen: the user's default, a saved address by id,
// or a one-off address typed into the form.
export type AddressSelection =
  | { mode: 'default' }
  | { mode: 'saved'; addressId: string }
  | { mode: 'manual'; value: AddressValue };

// Narrows an unknown form value to an AddressSelection.
export function isAddressSelection(value: unknown): value is AddressSelection {
  return (
    typeof value === 'object' &&
    value !== null &&
    'mode' in value &&
    typeof (value as { mode: unknown }).mode === 'string'
  );
}

// A manual selection wrapping a blank address.
export function emptyManualSelection(): AddressSelection {
  return { mode: 'manual', value: emptyAddress() };
}

// Trims a string, returning null when empty.
function text(value: string): string | null {
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

// Converts a form address to the API payload shape.
export function addressToPayload(address: AddressValue): AddressPayload {
  return {
    fullAddress: text(address.fullAddress),
    village: text(address.village),
    district: text(address.district),
    city: text(address.city),
    state: text(address.state),
    country: text(address.country),
    pinCode: text(address.pinCode),
    mobileNumber: text(address.mobileNumber),
    altMobileNumber: text(address.altMobileNumber),
    latitude: coordinate(address.latitude),
    longitude: coordinate(address.longitude),
  };
}

// Whether the address has any user-entered value.
export function hasAddressValue(address: AddressPayload): boolean {
  return Object.values(address).some((value) => value !== null);
}
