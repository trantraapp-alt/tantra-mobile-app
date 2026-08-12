// DTOs for the aggregated home feed (`GET /api/v1/home`). Fields mirror the
// backend contract but are kept defensively optional: the feed is public,
// mixes several entity shapes, and a partial section must never crash the home
// screen. Dynamic listing values live under `attributes`; common fields
// (price, images, address, status…) are top-level.
import type { LocalizedText } from '@/features/sell';
import type { MarketplaceModule, ModuleCategory } from '@/types';

// Whether a listing is offered for sale, for rent, or both.
export type FeedListingType = 'SELL' | 'RENT' | 'BOTH';

// Lifecycle status of a feed listing.
export type FeedListingStatus = 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'DRAFT';

// Seller subscription tier — drives the premium badge and highlight color.
export type SellerPlanKey = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';

// Structured address carried on a feed listing.
export interface FeedAddress {
  // Village / locality.
  village?: string | null;
  // District.
  district?: string | null;
  // State.
  state?: string | null;
  // PIN / postal code.
  pincode?: string | null;
  // Latitude, when known.
  lat?: number | null;
  // Longitude, when known.
  lng?: number | null;
  // Additional fields as returned by the listing / deal endpoints (the address
  // stores coordinates as strings and carries a free-text full address).
  city?: string | null;
  country?: string | null;
  fullAddress?: string | null;
  pinCode?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  mobileNumber?: string | null;
  altMobileNumber?: string | null;
}

// A single listing tile as returned in every home-feed section.
export interface FeedListing {
  // Public reference (e.g. "LT1A2B3C4D").
  listingId: string;
  // Owning seller.
  userId?: string;
  // Owning module / category.
  moduleId?: number;
  categoryId?: number;
  // Localized category name, when the API includes it.
  categoryName?: LocalizedText | string | null;
  // Optional display title (falls back to attributes / category name).
  title?: LocalizedText | string | null;
  // Plain display title returned by the detail endpoint (ListingCardDTO).
  listingTitle?: string | null;
  // Sale / rent.
  listingType?: FeedListingType | string;
  // Original price (shown struck through when higher than the offered price).
  actualPrice?: number | null;
  // Price shown prominently.
  offeredPrice?: number | null;
  // Discount percentage, e.g. 15.5.
  discountPct?: number | null;
  // Available quantity + its unit (e.g. 50 "kg").
  quantity?: number | null;
  unit?: string | null;
  // Whether the price is negotiable.
  isNegotiable?: boolean;
  // Whether a contact button should be shown.
  showContact?: boolean;
  // Image URLs (relative `/files/..` paths or absolute); first = thumbnail.
  images?: string[] | null;
  // Structured address.
  address?: FeedAddress | null;
  // Category-specific field values.
  attributes?: Record<string, unknown> | null;
  // Lifecycle status.
  status?: FeedListingStatus | string;
  // Engagement counters.
  viewCount?: number;
  contactRevealCount?: number;
  // Creation timestamp (ISO-8601).
  createdAt?: string;
  // Distance from the user's GPS point; present only when a lat/lng was sent.
  distanceKm?: number | null;
  // Premium presentation.
  isHighlighted?: boolean;
  highlightColor?: string | null;
  sellerBadge?: LocalizedText | null;
  sellerPlanKey?: SellerPlanKey | string | null;
  // Seller display fields (populated on the listing-detail response).
  sellerName?: string | null;
  sellerVerified?: boolean;
}

// A promotional banner in the home carousel.
export interface PromoCard {
  // Stable id.
  cardId: string;
  // Bilingual title / subtitle overlay.
  title: LocalizedText;
  subtitle?: LocalizedText | null;
  // Full-bleed image; when absent, `bgColor` fills the card instead.
  imageUrl?: string | null;
  // Background color used when there is no image (gradient start).
  bgColor?: string;
  // Optional gradient end color; when set the card fills with a diagonal
  // `bgColor → bgColorEnd` gradient instead of a flat fill.
  bgColorEnd?: string;
  // Text overlay color.
  textColor?: string;
  // Optional call-to-action.
  ctaLabel?: LocalizedText | null;
  ctaType?: 'MODULE' | 'CATEGORY' | 'EXTERNAL' | 'NONE' | string;
  ctaValue?: string | null;
  // Pre-applied listing type (RENT / SELL) for a CATEGORY promo. When the
  // backend omits it, the client infers it from the title (a "Rent …" card
  // opens the browse pre-filtered to RENT).
  listingType?: string | null;
  // Sort order (lower first).
  displayOrder?: number;
  // District this card is scoped to, when localized.
  targetDistrict?: string | null;
}

// The "Featured Listings" section wrapper.
export interface FeaturedListingsSection {
  // Localized section title.
  title?: LocalizedText | null;
  // Featured tiles.
  listings: FeedListing[];
}

// A per-module section: the module, its top categories, and a listing sample.
export interface HomeModuleSection {
  // The owning module.
  module: MarketplaceModule;
  // Up to a few top categories, rendered as chips.
  topCategories: ModuleCategory[];
  // A sample of the module's listings.
  listings: FeedListing[];
}

// A featured business profile tile (verified / premium sellers).
export interface FeaturedBusiness {
  // Identifiers.
  profileId?: string;
  userId?: string;
  // Display name.
  businessName?: string;
  // Machine key + localized label for the profile type.
  profileType?: string;
  profileTypeLabel?: LocalizedText | string | null;
  // Cover / logo image (may instead live under `attributes`).
  imageUrl?: string | null;
  logoUrl?: string | null;
  // Location.
  district?: string;
  state?: string;
  address?: FeedAddress | null;
  // Dynamic profile fields (photos, etc.).
  attributes?: Record<string, unknown> | null;
  // Premium presentation.
  isHighlighted?: boolean;
  highlightColor?: string | null;
  badge?: LocalizedText | null;
  planKey?: string | null;
  // Tolerate additional server fields without a type break.
  [key: string]: unknown;
}

// The full home-feed payload.
export interface HomeFeed {
  // When the feed was generated (ISO-8601).
  generatedAt?: string;
  // Marketplace modules for the tab strip.
  modules: MarketplaceModule[];
  // Promo banners.
  promoCards: PromoCard[];
  // Featured listings section.
  featuredListings?: FeaturedListingsSection | null;
  // Per-module sections.
  moduleSections: HomeModuleSection[];
  // Featured business profiles.
  featuredProfiles: FeaturedBusiness[];
  // Recently added listings.
  recentListings: FeedListing[];
}
