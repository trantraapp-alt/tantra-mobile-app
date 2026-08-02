// Style factory for ActiveFilterChips.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds ActiveFilterChips styles from the active theme.
export function createActiveFilterChipsStyles(theme: AppTheme) {
  return StyleSheet.create({
    railContent: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
      alignItems: 'center',
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.radius.pill,
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
