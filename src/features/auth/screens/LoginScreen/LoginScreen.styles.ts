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
    // Right-aligned forgot-password action.
    forgot: {
      alignSelf: 'flex-end',
      marginTop: -theme.spacing.sm,
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
