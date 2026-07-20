// Fully assembled dark theme object consumed through the theme provider.
import { animation, easing, opacity } from './animation';
import { darkColors } from './colors';
import { elevation } from './elevation';
import type { AppTheme } from './lightTheme';
import { cardRadius, radius } from './radius';
import { shadows } from './shadows';
import { sizing } from './sizing';
import { spacing } from './spacing';
import { fontFamily, fontSize, fontWeight, lineHeight, typography } from './typography';

// Concrete dark theme instance sharing all non-color tokens with the light theme.
export const darkTheme: AppTheme = {
  scheme: 'dark',
  isDark: true,
  colors: darkColors,
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
