// Accent colour families for colour-coded surfaces — the category cards in the
// sell flow, the tabs above them, and the cards that close those screens.
//
// The semantic scheme in `colors.ts` carries one colour per role (`success`,
// `warning`, …). A tinted card needs four related shades of that role at once:
// a pale ground, a firmer tint for its borders and chips, a deep shade dark
// enough to read as text, and a saturated fill that carries white content. So
// each accent is a small family rather than a single token.
//
// Light values are lifted from the sell design. Dark ones are translucent for
// the two grounds — a tint over the page keeps its own colour on any surface —
// with lifted shades for text and fills, which would otherwise sink into the
// background.

// A role that can accent a surface.
export type AccentName =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

// The four shades every accented surface draws from.
export interface AccentPalette {
  // Pale ground for the surface itself.
  surface: string;
  // Firmer tint for borders, icon circles and soft chips.
  soft: string;
  // Deep shade, legible as text on `surface` and as a filled action.
  strong: string;
  // Saturated fill that carries white content.
  solid: string;
}

// Accent families for the light colour scheme.
export const lightAccents: Record<AccentName, AccentPalette> = {
  primary: {
    surface: '#F4F2FD',
    soft: '#E5DDFB',
    strong: '#5B3FBF',
    solid: '#8B5CF6',
  },
  secondary: {
    surface: '#FFF4EC',
    soft: '#FBE2CD',
    strong: '#B4530F',
    solid: '#F97316',
  },
  success: {
    surface: '#F1F9EE',
    soft: '#DDEFD6',
    strong: '#1F7A3A',
    solid: '#4CAF50',
  },
  warning: {
    surface: '#FEF8EC',
    soft: '#FAEBCD',
    strong: '#B8860B',
    solid: '#F0B429',
  },
  danger: {
    surface: '#FDF0F0',
    soft: '#F8DBDB',
    strong: '#C0392B',
    solid: '#E05252',
  },
  info: {
    surface: '#EEF5FD',
    soft: '#DBE8FA',
    strong: '#1D5FA8',
    solid: '#3B82F6',
  },
};

// Accent families for the dark colour scheme.
export const darkAccents: Record<AccentName, AccentPalette> = {
  primary: {
    surface: '#8B5CF61F',
    soft: '#8B5CF633',
    strong: '#C4B5FD',
    solid: '#8B5CF6',
  },
  secondary: {
    surface: '#F973161F',
    soft: '#F9731633',
    strong: '#FDBA74',
    solid: '#F97316',
  },
  success: {
    surface: '#22C55E1F',
    soft: '#22C55E33',
    strong: '#4ADE80',
    solid: '#22C55E',
  },
  warning: {
    surface: '#F59E0B1F',
    soft: '#F59E0B33',
    strong: '#FBBF24',
    solid: '#F59E0B',
  },
  danger: {
    surface: '#EF44441F',
    soft: '#EF444433',
    strong: '#F87171',
    solid: '#EF4444',
  },
  info: {
    surface: '#3B82F61F',
    soft: '#3B82F633',
    strong: '#60A5FA',
    solid: '#3B82F6',
  },
};
