// Style factory for the SellSheet component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds sell sheet styles from the active theme.
export function createSellSheetStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Single horizontal row holding the module option cards.
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    // Loading placeholder wrapper (equal share of the row).
    skeletonItem: {
      flex: 1,
    },
  });
}
