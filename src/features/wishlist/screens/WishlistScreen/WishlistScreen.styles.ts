// Style factory for the WishlistScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds wishlist screen styles from the active theme.
export function createWishlistStyles(theme: AppTheme) {
  return StyleSheet.create({
    // FlashList content padding.
    list: {
      padding: theme.spacing.md,
    },
    // Individual grid cell wrapper.
    cell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
  });
}
