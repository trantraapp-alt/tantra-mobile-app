// Barrel export for the design system theme layer.
export { animation, easing, opacity } from './animation';
export { type ColorScheme, darkColors, lightColors } from './colors';
export { darkTheme } from './darkTheme';
export { elevation, type ElevationKey } from './elevation';
export { type AppTheme, lightTheme } from './lightTheme';
export {
  cardRadius,
  type CardRadiusKey,
  radius,
  type RadiusKey,
} from './radius';
export { type ShadowKey, shadows } from './shadows';
export { sizing, type SizingKey } from './sizing';
export { spacing, type SpacingKey } from './spacing';
export {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  typography,
  type TypographyVariant,
} from './typography';

import { darkTheme } from './darkTheme';
import { type AppTheme, lightTheme } from './lightTheme';

// Color scheme name supported by the app.
export type ColorSchemeName = 'light' | 'dark';

// Lookup map from scheme name to its resolved theme.
export const themes: Record<ColorSchemeName, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
};
