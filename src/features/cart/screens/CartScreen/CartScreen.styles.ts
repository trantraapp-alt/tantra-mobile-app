// Style factory for the CartScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds cart screen styles from the active theme.
export function createCartStyles(theme: AppTheme) {
  return StyleSheet.create({
    // FlashList content padding.
    list: {
      padding: theme.spacing.lg,
    },
    // Spacing between list items.
    separator: {
      height: theme.spacing.md,
    },
    // Sticky summary panel.
    summary: {
      padding: theme.spacing.lg,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.sm,
      ...theme.shadows.high,
    },
    // Row within the summary.
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    // Checkout button spacing.
    checkout: {
      marginTop: theme.spacing.md,
    },
  });
}
