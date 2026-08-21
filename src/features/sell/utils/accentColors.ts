// Turns a named accent into the colours an accented surface needs. The visual
// maps next door only *name* an accent; this is the single place that name
// becomes theme colours, so every tinted card in the sell flow tints alike.
import type { AccentName, AccentPalette, AppTheme } from '@/theme';

// Semantic colour key usable to accent a module or category.
export type AccentKey = AccentName;

// An accent's four shades, plus the two aliases most callers reach for: the
// fill they draw actions in, and the ground they tint a card with.
export interface AccentColors extends AccentPalette {
  // Saturated fill for actions and marks (alias of `solid`).
  accent: string;
  // Pale ground for a tinted card (alias of `surface`).
  tint: string;
}

// Resolves an accent key against the active theme.
export function getAccentColors(
  theme: AppTheme,
  accent: AccentKey,
): AccentColors {
  const palette = theme.accents[accent];
  return { ...palette, accent: palette.solid, tint: palette.surface };
}
