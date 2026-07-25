// Style factory for the AddressSelectorField component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds address selector styles from the active theme.
export function createAddressSelectorStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Field wrapper.
    container: {
      gap: theme.spacing.sm,
    },
    // Read-only preview of the chosen default/saved address.
    preview: {
      gap: theme.spacing.xxs,
    },
    // Row holding the "create new" action.
    actions: {
      flexDirection: 'row',
    },
  });
}
