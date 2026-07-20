// Typography tokens: font families, weights, and semantic text styles.
import type { TextStyle } from 'react-native';

// Font family names registered via expo-font (see providers/FontProvider).
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

// Numeric font weights kept in sync with the loaded font families.
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

// Raw font size scale.
export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
} as const;

// Line height scale aligned with the font size scale.
export const lineHeight = {
  xs: 16,
  sm: 18,
  md: 22,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 38,
  display: 44,
} as const;

// Semantic, ready-to-spread text styles consumed by components.
export const typography = {
  display: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    fontWeight: fontWeight.bold,
  },
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    lineHeight: lineHeight.xxxl,
    fontWeight: fontWeight.bold,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    lineHeight: lineHeight.xxl,
    fontWeight: fontWeight.bold,
  },
  h3: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    fontWeight: fontWeight.semibold,
  },
  h4: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontWeight: fontWeight.semibold,
  },
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontWeight: fontWeight.regular,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.regular,
  },
  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.medium,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: fontWeight.regular,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: fontWeight.medium,
  },
  overline: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
  },
  button: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.semibold,
  },
} as const satisfies Record<string, TextStyle>;

export type Typography = typeof typography;
export type TypographyVariant = keyof Typography;
