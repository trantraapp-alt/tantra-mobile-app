// Style factory for the SellCategoryForm wrapper.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds sell category form wrapper styles from the active theme.
export function createSellCategoryFormStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Centered wrapper for the loading and error states.
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
  });
}
