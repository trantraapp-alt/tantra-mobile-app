// Border radius scale for consistent corner rounding.
export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  pill: 999,
  full: 9999,
} as const;

export type Radius = typeof radius;
export type RadiusKey = keyof Radius;

// Corner radii tuned specifically for card surfaces: tighter, softer corners
// than the general radius scale. Consumed through the Card component's `radius`
// prop so every card shares the same rounded-corner language.
export const cardRadius = {
  // Snug corners for dense/compact cards (6).
  sm: 6,
  // Default card corners (8).
  md: 8,
  // Roomier corners for feature cards (12).
  lg: 12,
  // Softest corners for large hero cards (14).
  xl: 14,
} as const;

export type CardRadius = typeof cardRadius;
export type CardRadiusKey = keyof CardRadius;
