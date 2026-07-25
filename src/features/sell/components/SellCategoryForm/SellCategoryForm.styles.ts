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
    // Subcategory picker scroll content.
    pickerContent: {
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    // Stacked subcategory cards.
    pickerGrid: {
      gap: theme.spacing.sm,
    },
    // One subcategory row inside its card.
    pickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    // Wraps the leaf header + form.
    leafWrap: {
      flex: 1,
    },
    // Back row shown above a drilled-in leaf form.
    leafHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
    },
  });
}
