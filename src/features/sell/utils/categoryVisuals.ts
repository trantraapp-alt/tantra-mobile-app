// Maps category keys to a representative Lucide icon and accent color, used as
// the fallback visual until a real image asset is provided for the category
// (see categoryImages.ts). Categories shown together get distinct icons and
// colors; unknown/new categories fall back to a deterministic, varied visual.
import {
  Bird,
  Box,
  Boxes,
  Briefcase,
  Fish,
  Layers,
  Leaf,
  type LucideIcon,
  Package,
  PawPrint,
  ShoppingBasket,
  SprayCan,
  Sprout,
  Stethoscope,
  Store,
  Tag,
  Tractor,
  Wheat,
  Wrench,
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
  // Emoji glyph shown in the sell flow (mirrors the Home "Browse Categories"
  // tiles so the sell module/category screens use the same visuals).
  emoji: string;
  // Theme color-scheme key used to tint the icon.
  accent: CategoryAccent;
}

// Per-category-key visuals (exact-match fast path). Categories that appear in
// the same grid have distinct icons AND accents.
const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  CAT_CROP: { icon: Wheat, emoji: '🌾', accent: 'success' },
  CAT_SEED: { icon: Sprout, emoji: '🌱', accent: 'info' },
  CAT_FERTILIZER: { icon: Leaf, emoji: '🧪', accent: 'warning' },
  CAT_EQUIPMENT: { icon: Tractor, emoji: '🚜', accent: 'primary' },
  CAT_PESTICIDE: { icon: SprayCan, emoji: '🧴', accent: 'danger' },
  CAT_POULTRY: { icon: Bird, emoji: '🐔', accent: 'warning' },
  CAT_FISHERY: { icon: Fish, emoji: '🐟', accent: 'info' },
  CAT_ANIMAL: { icon: PawPrint, emoji: '🐄', accent: 'secondary' },
};

// Keyword rules so top-level and differently-keyed categories still resolve to
// a relatable, distinct visual (order matters: more specific groups first).
const CATEGORY_RULES: { match: RegExp; visual: CategoryVisual }[] = [
  {
    match: /vet|veterin|clinic|pashu-chikitsa/,
    visual: { icon: Stethoscope, emoji: '🩺', accent: 'info' },
  },
  {
    match: /repair|mainten|maramat/,
    visual: { icon: Wrench, emoji: '🔧', accent: 'info' },
  },
  {
    match: /service|labour|labor|seva|sevah/,
    visual: { icon: Briefcase, emoji: '💼', accent: 'secondary' },
  },
  {
    match: /market|bazaar|bazar|shop|store|dukan/,
    visual: { icon: Store, emoji: '🏪', accent: 'primary' },
  },
  {
    match: /veget|sabzi|sabji/,
    visual: { icon: ShoppingBasket, emoji: '🥬', accent: 'success' },
  },
  {
    match: /crop|wheat|grain|cereal/,
    visual: { icon: Wheat, emoji: '🌾', accent: 'success' },
  },
  { match: /seed/, visual: { icon: Sprout, emoji: '🌱', accent: 'info' } },
  { match: /fertil/, visual: { icon: Leaf, emoji: '🧪', accent: 'warning' } },
  {
    match: /equip|tractor|machine/,
    visual: { icon: Tractor, emoji: '🚜', accent: 'primary' },
  },
  {
    match: /pestic|spray/,
    visual: { icon: SprayCan, emoji: '🧴', accent: 'danger' },
  },
  {
    match: /poultry|hen|chicken/,
    visual: { icon: Bird, emoji: '🐔', accent: 'warning' },
  },
  { match: /fish/, visual: { icon: Fish, emoji: '🐟', accent: 'info' } },
  {
    match: /animal|livestock|cattle|pashu/,
    visual: { icon: PawPrint, emoji: '🐄', accent: 'secondary' },
  },
  {
    match: /agri|farm|krishi|kheti/,
    visual: { icon: Sprout, emoji: '🌱', accent: 'success' },
  },
];

// Icon and accent pools for unknown categories, cycled by a key hash so each new
// category gets a differing (deterministic) icon and color.
const FALLBACK_ICONS: LucideIcon[] = [
  Package,
  Boxes,
  Tag,
  ShoppingBasket,
  Layers,
  Box,
];
const FALLBACK_ACCENTS: CategoryAccent[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
];
const FALLBACK_EMOJIS: string[] = ['📦', '🧺', '🏷️', '🛒', '🗂️', '🧰'];

// Stable non-negative hash of a string.
function hashKey(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

// Returns the visual for a category key: an exact match, then a keyword match,
// then a deterministic, varied fallback (so future categories differ).
export function getCategoryVisual(categoryKey: string): CategoryVisual {
  const exact = CATEGORY_VISUALS[categoryKey];
  if (exact) {
    return exact;
  }
  const key = categoryKey.toLowerCase();
  const rule = CATEGORY_RULES.find((entry) => entry.match.test(key));
  if (rule) {
    return rule.visual;
  }
  const iconHash = hashKey(categoryKey);
  const accentHash = hashKey(`${categoryKey}#accent`);
  return {
    icon: FALLBACK_ICONS[iconHash % FALLBACK_ICONS.length] ?? Package,
    emoji: FALLBACK_EMOJIS[iconHash % FALLBACK_EMOJIS.length] ?? '📦',
    accent: FALLBACK_ACCENTS[accentHash % FALLBACK_ACCENTS.length] ?? 'primary',
  };
}
