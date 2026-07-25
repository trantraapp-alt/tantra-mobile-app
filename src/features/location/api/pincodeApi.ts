// Free India PIN-code lookup (api.postalpincode.in). Deliberately uses plain
// fetch, NOT the app's httpClient: this is a third-party host, so it must not
// receive the app's Authorization bearer token, `lang` param or ngrok headers,
// and it does not use the app base URL.
import { logger } from '@/lib';

import type { PincodeResult } from '../types';

// Base URL of the free postal PIN-code service.
const PINCODE_URL = 'https://api.postalpincode.in/pincode';
// Abort the lookup after this long so a slow network never hangs the form.
const TIMEOUT_MS = 8000;

// A single post office entry from the PIN API.
interface PostOffice {
  Name: string;
  Block: string;
  District: string;
  State: string;
  Country: string;
  Pincode: string;
}

// One PIN API response entry.
interface PincodeApiEntry {
  Status: string;
  PostOffice: PostOffice[] | null;
}

// Looks up a 6-digit PIN code, returning its district/state/country, or null
// when the PIN is invalid, unknown, or the service is unreachable.
export async function lookupPincode(
  pinCode: string,
): Promise<PincodeResult | null> {
  if (!/^\d{6}$/.test(pinCode)) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${PINCODE_URL}/${pinCode}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    const json = (await response.json()) as PincodeApiEntry[];
    const entry = Array.isArray(json) ? json[0] : undefined;
    const office = entry?.PostOffice?.[0];
    if (!entry || entry.Status !== 'Success' || !office) {
      return null;
    }
    return {
      pinCode,
      // The API has no distinct city field; the district is the closest match.
      city: office.District,
      district: office.District,
      state: office.State,
      country: office.Country,
    };
  } catch (error) {
    logger.warn('[Location] PIN lookup failed', { pinCode, error });
    return null;
  } finally {
    clearTimeout(timer);
  }
}
