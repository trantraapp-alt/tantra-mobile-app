// Style factory for the PriceTag component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds price tag styles from the active theme.
export function createPriceTagStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Row wrapping the price and its context.
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    // Struck-through original price.
    compareAt: {
      textDecorationLine: 'line-through',
    },
    // Discount percentage label.
    discount: {
      marginLeft: theme.spacing.xxs,
    },
  });
}
