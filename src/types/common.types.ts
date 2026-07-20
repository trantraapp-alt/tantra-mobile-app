// Shared primitive and utility types used across features.

// ISO 8601 date-time string.
export type IsoDateString = string;

// Generic identifier type.
export type ID = string;

// Monetary amount expressed in major currency units.
export type Money = number;

// Generic status of an asynchronous operation.
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

// Sort direction for list queries.
export type SortDirection = 'asc' | 'desc';

// Physical address used for shipping and billing.
export interface Address {
  // Unique address identifier.
  id: ID;
  // Full name of the recipient.
  fullName: string;
  // Contact phone number.
  phone: string;
  // Primary street / house line.
  addressLine1: string;
  // Secondary address line (optional).
  addressLine2?: string;
  // City name.
  city: string;
  // State or province.
  state: string;
  // Postal / ZIP code.
  postalCode: string;
  // Country name.
  country: string;
  // Whether this is the default address.
  isDefault: boolean;
  // Address label such as Home or Work.
  label?: string;
}

// Selectable option used by dropdowns, chips and filters.
export interface SelectOption<TValue = string> {
  // Display label.
  label: string;
  // Underlying value.
  value: TValue;
}
