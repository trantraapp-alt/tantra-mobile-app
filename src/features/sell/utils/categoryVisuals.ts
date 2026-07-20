// Maps category keys to a representative Lucide icon and accent color, used as
// the fallback visual until a real image asset is provided for the category
// (see categoryImages.ts).
import {
  Bird,
  Fish,
  Leaf,
  type LucideIcon,
  Package,
  PawPrint,
  SprayCan,
  Sprout,
  Tractor,
  Wheat,
} from 'lucide-react-native';

import type { ColorScheme } from '@/theme';

// Semantic color keys usable to tint a category icon.
type CategoryAccent = Extract<
  keyof ColorScheme,
  'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
>;

// Visual descriptor for a category entry.
export interface CategoryVisual {
  // Icon rendered when no image asset is available.
  icon: LucideIcon;
  // Theme color-scheme key used to tint the icon.
  accent: CategoryAccent;
}

// Per-category-key visuals for the Agriculture module categories.
const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  CAT_CROP: { icon: Wheat, accent: 'success' },
  CAT_EQUIPMENT: { icon: Tractor, accent: 'primary' },
  CAT_POULTRY: { icon: Bird, accent: 'warning' },
  CAT_FISHERY: { icon: Fish, accent: 'info' },
  CAT_SEED: { icon: Sprout, accent: 'success' },
  CAT_FERTILIZER: { icon: Leaf, accent: 'success' },
  CAT_ANIMAL: { icon: PawPrint, accent: 'secondary' },
  CAT_PESTICIDE: { icon: SprayCan, accent: 'danger' },
};

// Returns the visual for a category key, falling back to a generic package icon.
export function getCategoryVisual(categoryKey: string): CategoryVisual {
  return CATEGORY_VISUALS[categoryKey] ?? { icon: Package, accent: 'primary' };
}
