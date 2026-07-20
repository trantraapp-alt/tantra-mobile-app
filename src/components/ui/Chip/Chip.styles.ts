// Style factory for the Chip component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds chip styles from the active theme.
export function createChipStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Shared pill base.
    base: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
    },
    // Selected appearance.
    selected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    // Unselected appearance.
    unselected: {
      backgroundColor: theme.colors.transparent,
      borderColor: theme.colors.border,
    },
  });
}
