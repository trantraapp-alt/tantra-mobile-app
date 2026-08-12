// Style factory for the shared ListingHeader.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds ListingHeader styles from the active theme.
export function createListingHeaderStyles(theme: AppTheme) {
  return StyleSheet.create({
    // SafeAreaView wrapper that paints primaryLight behind the status bar and
    // consumes only the remaining top inset (handles any parent navigator).
    safeWrap: {
      backgroundColor: theme.colors.primaryLight,
    },
    // Row: back button, title/search block, action icons.
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
    },
    // White circular button on the violet header (icon color set per button).
    iconBtn: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.pill,
    },
    // Title + count take the free space; a fixed height (matching the search
    // bar) keeps the header height constant when toggling search — no flicker.
    titleBlock: {
      flex: 1,
      minWidth: 0,
      height: theme.sizing.inputHeight,
      justifyContent: 'center',
    },
    // The in-header search bar takes the free space — same fixed height as the
    // title block so the header never jumps.
    searchWrap: {
      flex: 1,
      height: theme.sizing.inputHeight,
      justifyContent: 'center',
    },
  });
}
