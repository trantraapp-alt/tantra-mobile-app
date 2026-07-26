// Style factory for the SellCategoriesScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds sell categories screen styles from the active theme.
export function createSellCategoriesStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Vertical stack filling the space below the header: a horizontal category
    // strip on top, the listing form below.
    split: {
      flex: 1,
    },
    // Top category strip (sizes to its content).
    rail: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
      backgroundColor: theme.colors.surface,
    },
    // Listing form filling the remaining height.
    form: {
      flex: 1,
    },
  });
}
