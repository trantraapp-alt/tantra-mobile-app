// Style factory for the LoginScreen form content (layout inside AuthShell).
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds login form styles from the active theme.
export function createLoginStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Vertically stacked form fields.
    form: {
      gap: theme.spacing.lg,
    },
    // Row holding the remember-me checkbox and forgot-password action.
    optionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    // Forgot-password action (kept compact within the options row).
    forgot: {
      marginRight: -theme.spacing.sm,
    },
    // Footer row pinned to the bottom of the sheet.
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 'auto',
    },
  });
}
