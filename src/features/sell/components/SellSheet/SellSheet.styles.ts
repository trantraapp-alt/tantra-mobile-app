// Style factory for the SellSheet component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds sell sheet styles from the active theme.
export function createSellSheetStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Row holding the two option cards.
    row: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
    },
    // Loading placeholder wrapper (half width).
    skeletonItem: {
      flex: 1,
    },
  });
}
