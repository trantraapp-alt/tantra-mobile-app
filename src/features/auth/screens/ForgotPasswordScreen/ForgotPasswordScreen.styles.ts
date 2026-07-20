// Style factory for the ForgotPasswordScreen form content (inside AuthShell).
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds forgot-password form styles from the active theme.
export function createForgotPasswordStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Vertically stacked form fields.
    form: {
      gap: theme.spacing.lg,
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
