// Style factory for the MyListingsScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds My Listings screen styles from the active theme.
export function createMyListingsScreenStyles(theme: AppTheme) {
  return StyleSheet.create({
    // List content padding.
    list: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
    // Spacing between cards.
    cell: {
      marginBottom: theme.spacing.md,
    },
    // Centered container for loading/error states.
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    // Card footer actions row.
    cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Wrapper that lets the Edit button flex.
    editWrap: {
      flex: 1,
    },
    // Load-more spinner container.
    footerLoader: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
  });
}
