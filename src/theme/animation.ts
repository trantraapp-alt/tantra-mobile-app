// Animation timing and easing tokens for consistent motion.
import { Easing } from 'react-native-reanimated';

// Animation durations in milliseconds.
export const animation = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
  // Duration of one full continuous rotation (e.g. the Sell button ring).
  spin: 3600,
} as const;

// Shared easing curves for Reanimated timing animations.
export const easing = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  decelerate: Easing.out(Easing.cubic),
  accelerate: Easing.in(Easing.cubic),
  linear: Easing.linear,
} as const;

// Opacity tokens for disabled, pressed and overlay states.
export const opacity = {
  faint: 0.08,
  subtle: 0.16,
  disabled: 0.5,
  muted: 0.6,
  pressed: 0.7,
  full: 1,
} as const;

export type Animation = typeof animation;
export type AnimationKey = keyof Animation;
