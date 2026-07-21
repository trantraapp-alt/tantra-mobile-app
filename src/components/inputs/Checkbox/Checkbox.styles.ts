// Style factory for the Checkbox component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds checkbox styles from the active theme.
export function createCheckboxStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Tappable row: box + label.
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // The square box.
    box: {
      width: theme.sizing.iconLg,
      height: theme.sizing.iconLg,
      borderRadius: theme.radius.sm,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    // Checked state.
    boxChecked: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
  });
}
