// Centralized color tokens for light and dark color schemes.
// Brand palette derived from the Tantra logo: violet primary + warm orange accent.

// Raw brand and neutral palette. Never consume these directly in UI code;
// always go through the semantic color scheme exposed on the active theme.
const palette = {
  // Violet (primary brand hue — the cart "T").
  violet50: '#F5F3FF',
  violet100: '#EDE9FE',
  violet200: '#DDD6FE',
  violet300: '#C4B5FD',
  violet400: '#A78BFA',
  violet500: '#8B5CF6',
  violet600: '#6D28D9',
  violet700: '#5B21B6',
  violet800: '#4C1D95',
  violet900: '#2E1065',
  // Warm accent (orange → red gradient of the cart wing).
  orange400: '#FB923C',
  orange500: '#F97316',
  orange600: '#EA580C',
  ember500: '#F4432C',
  // Neutrals (violet-tinted charcoals for dark mode cohesion).
  white: '#FFFFFF',
  black: '#000000',
  neutral50: '#FAFAFC',
  neutral100: '#F3F2F8',
  neutral200: '#E7E5F0',
  neutral300: '#D2CEDF',
  neutral400: '#9A93AE',
  neutral500: '#6B6480',
  ink700: '#332B47',
  ink800: '#241E38',
  ink850: '#1B1630',
  ink900: '#141026',
  ink950: '#0C0918',
  // States.
  green500: '#22C55E',
  green600: '#16A34A',
  amber500: '#F59E0B',
  red500: '#EF4444',
  red600: '#DC2626',
  blue500: '#3B82F6',
  yellow400: '#FACC15',
} as const;

// Shape of a fully-resolved semantic color scheme.
export interface ColorScheme {
  // Primary brand color for key actions.
  primary: string;
  // Darker primary shade for pressed states.
  primaryDark: string;
  // Lighter primary shade for tints and backgrounds.
  primaryLight: string;
  // Foreground color rendered on top of the primary color.
  onPrimary: string;
  // Secondary accent color.
  secondary: string;
  // Foreground color rendered on top of the secondary color.
  onSecondary: string;
  // Root screen background color.
  background: string;
  // Elevated surface background color (sheets, cards).
  surface: string;
  // Alternate surface color for subtle separation.
  surfaceVariant: string;
  // Card background color.
  card: string;
  // Default border color.
  border: string;
  // Divider / hairline color.
  divider: string;
  // Primary text color.
  textPrimary: string;
  // Secondary / muted text color.
  textSecondary: string;
  // Tertiary / placeholder text color.
  textTertiary: string;
  // Text color used on inverted backgrounds.
  textInverse: string;
  // Positive / success state color.
  success: string;
  // Cautionary / warning state color.
  warning: string;
  // Negative / error state color.
  danger: string;
  // Informational state color.
  info: string;
  // Modal / backdrop overlay color.
  overlay: string;
  // Base color for skeleton shimmer.
  skeletonBase: string;
  // Highlight color for skeleton shimmer.
  skeletonHighlight: string;
  // Rating star color.
  rating: string;
  // Fully transparent color.
  transparent: string;
}

// Semantic colors for the light color scheme.
export const lightColors: ColorScheme = {
  primary: palette.violet600,
  primaryDark: palette.violet700,
  primaryLight: palette.violet100,
  onPrimary: palette.white,
  secondary: palette.orange500,
  onSecondary: palette.white,
  background: palette.white,
  surface: palette.neutral50,
  surfaceVariant: palette.neutral100,
  card: palette.white,
  border: palette.neutral200,
  divider: palette.neutral200,
  textPrimary: palette.ink900,
  textSecondary: palette.neutral500,
  textTertiary: palette.neutral400,
  textInverse: palette.white,
  success: palette.green600,
  warning: palette.amber500,
  danger: palette.red600,
  info: palette.blue500,
  overlay: 'rgba(20, 16, 38, 0.55)',
  skeletonBase: palette.neutral200,
  skeletonHighlight: palette.neutral100,
  rating: palette.yellow400,
  transparent: 'transparent',
};

// Semantic colors for the dark color scheme.
export const darkColors: ColorScheme = {
  primary: palette.violet500,
  primaryDark: palette.violet600,
  primaryLight: palette.violet800,
  onPrimary: palette.white,
  secondary: palette.orange400,
  onSecondary: palette.ink900,
  background: palette.ink950,
  surface: palette.ink900,
  surfaceVariant: palette.ink800,
  card: palette.ink850,
  border: palette.ink700,
  divider: palette.ink700,
  textPrimary: palette.neutral50,
  textSecondary: palette.neutral400,
  textTertiary: palette.neutral500,
  textInverse: palette.ink900,
  success: palette.green500,
  warning: palette.amber500,
  danger: palette.red500,
  info: palette.blue500,
  overlay: 'rgba(0, 0, 0, 0.65)',
  skeletonBase: palette.ink800,
  skeletonHighlight: palette.ink700,
  rating: palette.yellow400,
  transparent: 'transparent',
};
