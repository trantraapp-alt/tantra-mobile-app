// Style factory for the QuickEditSheet component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds quick-edit sheet styles from the active theme.
export function createQuickEditSheetStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Stacked inline fields.
    fields: {
      gap: theme.spacing.lg,
    },
    // Primary action spacing.
    actions: {
      marginTop: theme.spacing.xl,
    },
    // Empty-state note when a listing has no inline-editable fields.
    empty: {
      paddingVertical: theme.spacing.lg,
    },
  });
}
