// Client for the Government of India (data.gov.in / Agmarknet) daily mandi price
// resource. Uses a plain `fetch` (not the app http client) because it targets a
// different origin and must not carry the app's auth / lang params.
//
// SECURITY NOTE: the key below is data.gov.in's shared public demo key — it is
// rate-limited and fine for an MVP, but for production either register a free
// personal key at data.gov.in, or (better) proxy this call through the Tantra
// backend so the key is never shipped inside the app and the daily data can be
// cached + enriched with day-over-day change. Swapping to a backend endpoint
// means only changing this file.
import type { MandiPrice } from '../types';

// data.gov.in resource: "Current Daily Price of Various Commodities from Various
// Markets (Mandi)".
const RESOURCE_URL =
  'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
// Public shared demo key (replace with your own / move to the backend).
const API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
// Give up on a slow request so the ticker falls back promptly.
const TIMEOUT_MS = 12000;

// Raw record shape from the API (prices arrive as strings or numbers).
interface RawRecord {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  grade?: string;
  arrival_date?: string;
  min_price?: number | string;
  max_price?: number | string;
  modal_price?: number | string;
}

// Coerces an API value to a finite number (0 when unparseable).
function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// Query parameters for a mandi-price lookup.
export interface GetMandiPricesParams {
  // State name exactly as Agmarknet spells it (e.g. "Maharashtra").
  state?: string;
  // District name (e.g. "Pune").
  district?: string;
  // Max records to pull.
  limit?: number;
}

// Fetches daily mandi prices, optionally scoped to a state / district.
export async function getMandiPrices(
  params: GetMandiPricesParams = {},
): Promise<MandiPrice[]> {
  const parts = [
    `api-key=${API_KEY}`,
    'format=json',
    `limit=${params.limit ?? 60}`,
    'offset=0',
  ];
  if (params.state && params.state.trim() !== '') {
    parts.push(`filters%5Bstate.keyword%5D=${encodeURIComponent(params.state.trim())}`);
  }
  if (params.district && params.district.trim() !== '') {
    parts.push(`filters%5Bdistrict%5D=${encodeURIComponent(params.district.trim())}`);
  }
  const url = `${RESOURCE_URL}?${parts.join('&')}`;

  // Bound the request with an abort timeout (RN fetch has no native timeout).
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`mandi request failed: ${response.status}`);
    }
    const body = (await response.json()) as { records?: RawRecord[] };
    return (body.records ?? [])
      .filter((r) => r.commodity && r.modal_price != null)
      .map((r) => ({
        state: r.state ?? '',
        district: r.district ?? '',
        market: r.market ?? '',
        commodity: r.commodity ?? '',
        variety: r.variety,
        grade: r.grade,
        arrivalDate: r.arrival_date ?? '',
        minPrice: toNumber(r.min_price),
        maxPrice: toNumber(r.max_price),
        modalPrice: toNumber(r.modal_price),
      }));
  } finally {
    clearTimeout(timer);
  }
}
