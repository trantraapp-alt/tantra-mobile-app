// Style factory for the AddressListScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds address list styles from the active theme.
export function createAddressListStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Bounds the list height between the header and footer so FlashList can
    // virtualize/scroll internally instead of the whole list scrolling away.
    listWrap: {
      flex: 1,
    },
    // List content padding.
    list: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
    // Spacing between address cards.
    cell: {
      marginBottom: theme.spacing.md,
    },
    // Centered container for loading / error states.
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    // Sticky footer holding the add button.
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
  });
}
