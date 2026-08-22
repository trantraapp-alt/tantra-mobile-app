// Style factory for UsersScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createUsersScreenStyles(theme: AppTheme) {
  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Search bar + filter icon, above the list.
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xs,
    },
    searchField: {
      flex: 1,
    },
    filterButton: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.radius.pill,
    },
    // Small dot on the filter icon's corner when a filter is active.
    filterDot: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: theme.spacing.sm,
      height: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      borderWidth: 1.5,
      borderColor: theme.colors.card,
    },
    resultCount: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
    },
    list: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxxl,
    },
    footerLoader: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
  });
}
