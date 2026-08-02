// Style factory for the NearbyScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds NearbyScreen styles from the active theme.
export function createNearbyScreenStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Centered "set your location" prompt shown when no GPS point is known.
    prompt: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
    },
    promptText: {
      gap: theme.spacing.xs,
    },
  });
}
