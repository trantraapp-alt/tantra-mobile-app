// Style factory for the WishlistScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds wishlist screen styles from the active theme.
export function createWishlistStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Grid content padding; extra bottom room clears the tab bar.
    list: {
      paddingHorizontal: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xxxl,
    },
    // One grid cell (two per row); inner padding is the inter-card gap.
    cell: {
      flex: 1,
      paddingHorizontal: theme.spacing.xs,
      paddingBottom: theme.spacing.md,
    },
    // Centered loading / error / empty state area.
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    // Placeholder card for a wishlisted listing the seller has deleted.
    unavailable: {
      flex: 1,
      minHeight: 180,
      borderRadius: theme.cardRadius.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
    },
  });
}
