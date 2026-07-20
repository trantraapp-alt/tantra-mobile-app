// Android elevation tokens mapped to Material elevation levels.
export const elevation = {
  none: 0,
  xs: 1,
  low: 2,
  medium: 4,
  high: 8,
  highest: 16,
} as const;

export type Elevation = typeof elevation;
export type ElevationKey = keyof Elevation;
