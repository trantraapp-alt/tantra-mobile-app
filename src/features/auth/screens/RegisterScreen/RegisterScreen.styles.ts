// Style factory for the RegisterScreen form content (layout inside AuthShell).
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds register form styles from the active theme.
export function createRegisterStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Vertically stacked form fields with comfortable, even spacing.
    form: {
      gap: theme.spacing.lg,
    },
    // Two-column row (first / last name).
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    // A single item within a two-column row.
    rowItem: {
      flex: 1,
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
