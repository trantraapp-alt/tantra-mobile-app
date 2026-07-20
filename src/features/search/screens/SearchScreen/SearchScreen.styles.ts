// Style factory for the SearchScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds search screen styles from the active theme.
export function createSearchStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Search bar row with a leading back button.
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
    },
    // Search input taking the remaining row width.
    searchInput: {
      flex: 1,
    },
    // Recent search row.
    recentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    // Recent search label.
    recentLabel: {
      flex: 1,
    },
  });
}
