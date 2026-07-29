// Style factory for the DateField component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds date field styles from the active theme.
export function createDateFieldStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Field wrapper (label + control + helper).
    container: {
      gap: theme.spacing.xs,
    },
    // Tappable control that opens the picker; mirrors a small TextField. Sits on
    // the page background (not a filled surface) so an editable field is never
    // mistaken for a disabled/locked one, which uses `surfaceVariant`.
    box: {
      minHeight: theme.sizing.inputHeightSm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    // Error state border.
    boxError: {
      borderColor: theme.colors.danger,
    },
  });
}
