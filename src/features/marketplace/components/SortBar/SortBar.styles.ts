// Style factory for the SortBar.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds SortBar styles from the active theme.
export function createSortBarStyles(theme: AppTheme) {
  return StyleSheet.create({
    railContent: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
      alignItems: 'center',
    },
    label: {
      marginRight: theme.spacing.xxs,
    },
    chip: {
      borderRadius: theme.radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
