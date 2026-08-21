// Style factory for the SellCategoryForm wrapper.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds sell category form wrapper styles from the active theme.
export function createSellCategoryFormStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Failed-load wrapper: the module tabs above a centered error state.
    errorWrap: {
      flex: 1,
      paddingTop: theme.spacing.sm,
    },
    // Centered wrapper for the loading and error states.
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    // Form-shaped loading skeleton content.
    formSkeleton: {
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    // One labeled input placeholder inside the form skeleton.
    fieldSkeleton: {
      gap: theme.spacing.xs,
    },
    // Wraps the info banner + the leaf listing form.
    leafFormWrap: {
      flex: 1,
    },
    // Padding around the info banner shown above the form (no top gap — it sits
    // directly under the header).
    leafInfo: {
      paddingHorizontal: theme.spacing.lg,
    },
  });
}
