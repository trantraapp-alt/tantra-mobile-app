// Style factory for the AddressCard component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds address card styles from the active theme.
export function createAddressCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Label + default badge row.
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    // Label takes the space the badge leaves.
    label: {
      flex: 1,
      minWidth: 0,
    },
    // Address summary spacing.
    summary: {
      marginBottom: theme.spacing.xxs,
    },
    // Actions row.
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.md,
    },
  });
}
