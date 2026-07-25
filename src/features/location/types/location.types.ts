// Types for device location and PIN-code lookup. Reverse geocoding uses the
// device OS geocoder (free, no key); PIN lookup uses the free India postal API.

// Address components resolved from a device fix or a PIN lookup.
export interface ResolvedPlace {
  // Village / locality (OSM "subregion").
  village: string;
  // District.
  district: string;
  // City / town.
  city: string;
  // State / region.
  state: string;
  // Country.
  country: string;
  // Postal / PIN code.
  pinCode: string;
  // Free-text line (name + street), when available.
  fullAddress: string;
  // Latitude of the fix, or null when unknown.
  latitude: number | null;
  // Longitude of the fix, or null when unknown.
  longitude: number | null;
}

// Outcome of a device-location request.
export type LocationStatus = 'granted' | 'denied' | 'unavailable' | 'timeout';

// Result of requesting the current device location.
export interface LocationOutcome {
  // How the request resolved.
  status: LocationStatus;
  // The resolved place, present when status is 'granted'.
  place?: ResolvedPlace;
}

// Result of a PIN-code lookup against the India postal API.
export interface PincodeResult {
  // The looked-up PIN code.
  pinCode: string;
  // City / town (falls back to district).
  city: string;
  // District.
  district: string;
  // State.
  state: string;
  // Country.
  country: string;
}
