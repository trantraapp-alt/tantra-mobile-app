// Style factory for the shared Card surface.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds card surface styles from the active theme.
export function createCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Resting card surface: filled background, subtle border for definition and
    // a soft, diffuse shadow (corner radius is applied per-instance).
    base: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.soft,
    },
    // Default inner padding applied when `padded` is enabled.
    padded: {
      padding: theme.spacing.lg,
    },
  });
}
