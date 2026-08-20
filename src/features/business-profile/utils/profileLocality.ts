// Shared "City, State" locality formatter for profile cards (owner + admin),
// pulled out of the stored address object rather than the richer, line-based
// address block the detail screen renders.
import type { BusinessProfile } from '../types/businessProfile.types';

// A short "City, State" locality from a profile's stored address, or null
// when neither field is present.
export function cardLocality(address: BusinessProfile['address'] | undefined): string | null {
  if (!address) {
    return null;
  }
  const city = typeof address.city === 'string' ? address.city.trim() : '';
  const state = typeof address.state === 'string' ? address.state.trim() : '';
  const parts = [city, state].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}
