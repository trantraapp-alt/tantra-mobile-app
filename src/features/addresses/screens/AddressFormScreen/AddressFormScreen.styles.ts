// Style factory for the AddressFormScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds address form styles from the active theme.
export function createAddressFormStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Fills the screen below the header.
    flex: {
      flex: 1,
    },
    // Scrollable form content above the sticky footer.
    content: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    // "Use current location" button spacing.
    locationButton: {
      marginBottom: theme.spacing.xs,
    },
    // Two-column field row.
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    // Each column in a row.
    rowItem: {
      flex: 1,
    },
    // Centered container for loading / error states.
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    // Sticky footer holding the save button.
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
  });
}
