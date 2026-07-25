// Style factory for the LocationSheet component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds location sheet styles from the active theme.
export function createLocationSheetStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Stacked sheet content.
    content: {
      gap: theme.spacing.md,
    },
    // Divider label between GPS and PIN entry.
    divider: {
      marginVertical: theme.spacing.xxs,
    },
  });
}
