// Style factory for the Screen container.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds screen container styles from the active theme.
export function createScreenStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Root safe-area wrapper filling the viewport.
    safeArea: {
      flex: 1,
    },
    // Base background variant.
    background: {
      backgroundColor: theme.colors.background,
    },
    // Elevated surface background variant.
    surface: {
      backgroundColor: theme.colors.surface,
    },
    // Inner content wrapper.
    content: {
      flex: 1,
    },
    // Default horizontal padding.
    padded: {
      paddingHorizontal: theme.spacing.lg,
    },
  });
}
