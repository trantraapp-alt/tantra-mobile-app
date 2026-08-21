// Fully assembled light theme object consumed through the theme provider.
import { type AccentName, type AccentPalette, lightAccents } from './accents';
import { animation, easing, opacity } from './animation';
import { type ColorScheme, lightColors } from './colors';
import { elevation } from './elevation';
import { cardRadius, radius } from './radius';
import { shadows } from './shadows';
import { sizing } from './sizing';
import { spacing } from './spacing';
import { fontFamily, fontSize, fontWeight, lineHeight, typography } from './typography';

// Complete theme contract shared by both color schemes.
export interface AppTheme {
  // Active color scheme identifier.
  scheme: 'light' | 'dark';
  // Whether this theme represents the dark color scheme.
  isDark: boolean;
  // Semantic colors for the active scheme.
  colors: ColorScheme;
  // Accent colour families for tinted, colour-coded surfaces.
  accents: Record<AccentName, AccentPalette>;
  // Spacing scale.
  spacing: typeof spacing;
  // Border radius scale.
  radius: typeof radius;
  // Card-specific corner radius scale.
  cardRadius: typeof cardRadius;
  // Fixed sizing tokens.
  sizing: typeof sizing;
  // Elevation tokens.
  elevation: typeof elevation;
  // Shadow presets.
  shadows: typeof shadows;
  // Semantic typography styles.
  typography: typeof typography;
  // Font family names.
  fontFamily: typeof fontFamily;
  // Font weight tokens.
  fontWeight: typeof fontWeight;
  // Font size scale.
  fontSize: typeof fontSize;
  // Line height scale.
  lineHeight: typeof lineHeight;
  // Animation duration tokens.
  animation: typeof animation;
  // Easing curves.
  easing: typeof easing;
  // Opacity tokens.
  opacity: typeof opacity;
}

// Concrete light theme instance.
export const lightTheme: AppTheme = {
  scheme: 'light',
  isDark: false,
  colors: lightColors,
  accents: lightAccents,
  spacing,
  radius,
  cardRadius,
  sizing,
  elevation,
  shadows,
  typography,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  animation,
  easing,
  opacity,
};
