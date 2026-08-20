import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createGradientProgressBarStyles(_theme: AppTheme) {
  return StyleSheet.create({
    track: {
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
    },
    // Covers the unfilled remainder of the track with the track color, on top
    // of the fixed-scale gradient, pinned to the right edge.
    mask: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
    },
  });
}
