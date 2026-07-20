// Style factory for the shared BottomSheet component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds shared bottom sheet styles from the active theme.
export function createBottomSheetStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Sheet surface background.
    background: {
      backgroundColor: theme.colors.background,
    },
    // Drag handle indicator.
    handleIndicator: {
      width: theme.spacing.xxl,
      backgroundColor: theme.colors.border,
    },
    // Content wrapper; horizontal/top padding is constant, bottom padding is
    // applied inline so it can include the device safe-area inset.
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      gap: theme.spacing.xl,
    },
    // Title / subtitle block.
    header: {
      gap: theme.spacing.xxs,
    },
  });
}
