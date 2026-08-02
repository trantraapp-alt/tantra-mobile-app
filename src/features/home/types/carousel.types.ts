// DB-driven home carousel of category browse buttons (GET /carousel). An admin
// can add / reorder / recolour buttons without an app update.
import type { LocalizedText } from '@/features/sell';

// What a carousel button does when tapped.
export type CarouselCtaType =
  | 'BROWSE_CATEGORY'
  | 'BROWSE_MODULE'
  | 'EXTERNAL_URL'
  | 'NONE';

// A single carousel button.
export interface CarouselItem {
  // Unique item id.
  id: number;
  // Bilingual button label.
  label: LocalizedText;
  // Optional icon image URL.
  iconUrl?: string | null;
  // Navigation type.
  ctaType: CarouselCtaType;
  // Target: a category key (BROWSE_CATEGORY), module ref (BROWSE_MODULE) or URL.
  ctaValue: string;
  // Pre-applied listing type filter (RENT / SELL), or null for all.
  listingType?: string | null;
  // Tile background colour (hex).
  bgColor: string;
  // Tile label colour (hex).
  textColor: string;
  // Sort order (lower shown first).
  displayOrder: number;
  // Only active items are shown.
  isActive: boolean;
}
