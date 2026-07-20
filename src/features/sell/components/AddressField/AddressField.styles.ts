// Style factory for the AddressField component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds address field styles from the active theme.
export function createAddressFieldStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Outer container.
    container: {
      width: '100%',
      gap: theme.spacing.sm,
    },
    // Stacked address sub-fields.
    fields: {
      gap: theme.spacing.md,
    },
    // Two-column row.
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    // A single item within a two-column row.
    rowItem: {
      flex: 1,
    },
  });
}
