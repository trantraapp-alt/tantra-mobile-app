// Backend-driven "Today's Deals" card + the CTA it navigates to. Every visible
// value (label / badge / unit / color / count / price) comes from the API — the
// frontend only renders and routes; nothing is hardcoded.

// What tapping a deal card does.
export type DealCtaType = 'DEAL_GROUP' | 'CATEGORY' | 'URL';

// One deal card in the home strip.
export interface DealCard {
  // Emoji/icon shown on the card. May be a plain word (e.g. "Crop") or absent.
  icon?: string;
  // Bilingual title.
  labelEn: string;
  labelHi: string;
  // Bilingual subtitle line (e.g. "किराए पर उपलब्ध").
  badgeEn: string;
  badgeHi: string;
  // Hex accent for the card styling (used when backendUi is false).
  accentColor: string;
  // Number of listings behind the deal (backend already drops 0-listing cards).
  listingCount: number;
  // Lowest price across the deal's listings; null when there is no priced listing.
  minPrice: number | null;
  // Bilingual price unit (e.g. "/day", "/दिन"); null for categories without a unit
  // (e.g. Animals).
  unitEn: string | null;
  unitHi: string | null;
  // When true AND backgroundImageUrl is set, the admin has supplied a full-card
  // background image — render it as the card instead of the accent-color design.
  backendUi: boolean;
  // Admin-supplied background image URL, or null (the default).
  backgroundImageUrl: string | null;
  // Navigation: DEAL_GROUP -> deal listings, CATEGORY -> browse, URL -> browser.
  ctaType: DealCtaType | string;
  ctaValue: string;
}
