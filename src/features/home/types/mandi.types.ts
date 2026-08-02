// A single daily mandi (market) commodity price, as returned by the
// data.gov.in Agmarknet "daily mandi prices" resource. Prices are ₹ per quintal.
export interface MandiPrice {
  // State the market is in (e.g. "Maharashtra").
  state: string;
  // District (e.g. "Pune").
  district: string;
  // Market / APMC name.
  market: string;
  // Commodity name (e.g. "Wheat").
  commodity: string;
  // Variety, when present.
  variety?: string;
  // Grade, when present.
  grade?: string;
  // Arrival date as "dd/mm/yyyy".
  arrivalDate: string;
  // Minimum, maximum and modal (most-traded) price in ₹/quintal.
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}
