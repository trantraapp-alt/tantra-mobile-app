// Maps module keys to a relatable icon and accent color, since the modules API
// provides no image. Categories carry their own iconUrl and do not use this.
import {
  Briefcase,
  type LucideIcon,
  PawPrint,
  Sprout,
  Store,
} from 'lucide-react-native';

import type { ColorScheme } from '@/theme';

// Visual descriptor for a module card.
export interface ModuleVisual {
  // Icon rendered as the card image.
  icon: LucideIcon;
  // Emoji glyph shown on the "Sell on Tantra" module cards (mirrors the Home
  // "Browse Categories" tiles).
  emoji: string;
  // Theme color-scheme key used to tint the module icon.
  accent: Extract<
    keyof ColorScheme,
    'primary' | 'secondary' | 'success' | 'warning' | 'info'
  >;
}

// Exact module-key visuals (fast path).
const MODULE_VISUALS: Record<string, ModuleVisual> = {
  MOD_AGRI: { icon: Sprout, emoji: '🌾', accent: 'success' },
  MOD_ANIMAL_LIVESTOCK: { icon: PawPrint, emoji: '🐄', accent: 'warning' },
  MOD_SERVICE_PROVIDER: { icon: Briefcase, emoji: '💼', accent: 'secondary' },
};

// Substring rules so a renamed or differently-cased module key still resolves
// to a relatable icon (e.g. "animal_livestock", "MOD_ANIMAL", "livestock").
const MODULE_RULES: { match: RegExp; visual: ModuleVisual }[] = [
  {
    match: /animal|livestock|poultry|fish|dairy|cattle|pashu/,
    visual: { icon: PawPrint, emoji: '🐄', accent: 'warning' },
  },
  {
    match: /agri|crop|farm|krishi|kheti/,
    visual: { icon: Sprout, emoji: '🌾', accent: 'success' },
  },
  {
    match: /service|repair|maramat|seva|sevah/,
    visual: { icon: Briefcase, emoji: '💼', accent: 'secondary' },
  },
  {
    match: /market|bazaar|bazar|store|shop|dukan/,
    visual: { icon: Store, emoji: '🏪', accent: 'primary' },
  },
];

// Returns the visual for a module key: an exact match first, then a keyword
// match, then a generic store icon.
export function getModuleVisual(moduleKey: string): ModuleVisual {
  const exact = MODULE_VISUALS[moduleKey];
  if (exact) {
    return exact;
  }
  const key = moduleKey.toLowerCase();
  const rule = MODULE_RULES.find((entry) => entry.match.test(key));
  return rule?.visual ?? { icon: Store, emoji: '🏪', accent: 'primary' };
}
