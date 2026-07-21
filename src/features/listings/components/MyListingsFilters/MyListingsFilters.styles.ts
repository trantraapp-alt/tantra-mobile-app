// Style factory for the MyListingsFilters component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds filter bar styles from the active theme.
export function createMyListingsFiltersStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Filter bar wrapper.
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
      backgroundColor: theme.colors.background,
    },
    // Wrapping row of status chips.
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
  });
}
