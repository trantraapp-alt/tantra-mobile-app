// Cross-platform shadow tokens combining iOS shadow props with Android elevation.
import type { ViewStyle } from 'react-native';

import { elevation } from './elevation';

// Shadow style definition shared by iOS and Android.
type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

// Base shadow color kept neutral so it works on both color schemes.
const shadowColor = '#141026';

// Named shadow presets from subtle to prominent.
export const shadows = {
  none: {
    shadowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: elevation.none,
  },
  // Near-invisible resting shadow for card surfaces. A faint, wide blur on iOS
  // and no Android elevation keep it almost imperceptible — cards rely on their
  // 1px border for definition, so the shadow is only a whisper of depth.
  soft: {
    shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: elevation.none,
  },
  low: {
    shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: elevation.low,
  },
  medium: {
    shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: elevation.medium,
  },
  high: {
    shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: elevation.high,
  },
  highest: {
    shadowColor,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: elevation.highest,
  },
} as const satisfies Record<string, ShadowStyle>;

export type Shadows = typeof shadows;
export type ShadowKey = keyof Shadows;
