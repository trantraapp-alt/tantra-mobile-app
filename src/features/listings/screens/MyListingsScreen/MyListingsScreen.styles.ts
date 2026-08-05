// Style factory for the MyListingsScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds My Listings screen styles from the active theme.
export function createMyListingsScreenStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Grid content padding.
    list: {
      paddingHorizontal: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xxl,
    },
    // One grid cell (two per row); the inner padding is the inter-card gap.
    cell: {
      flex: 1,
      paddingHorizontal: theme.spacing.xs,
      paddingBottom: theme.spacing.md,
    },
    // Each footer button fills half of the action row.
    footerButton: {
      flex: 1,
    },
    // Centered container for loading/error states.
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    // Load-more spinner container.
    footerLoader: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
  });
}
