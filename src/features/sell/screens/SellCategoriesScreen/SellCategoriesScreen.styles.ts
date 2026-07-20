// Style factory for the SellCategoriesScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds sell categories screen styles from the active theme.
export function createSellCategoriesStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Horizontal split filling the space below the header.
    split: {
      flex: 1,
      flexDirection: 'row',
    },
    // Left category rail occupying 25% of the width.
    rail: {
      flex: 1,
      borderRightWidth: 1,
      borderRightColor: theme.colors.divider,
      backgroundColor: theme.colors.surface,
    },
    // Right listing form occupying 75% of the width.
    form: {
      flex: 3,
    },
  });
}
