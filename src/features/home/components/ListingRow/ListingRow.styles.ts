// Style factory for the ListingRow.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds ListingRow styles from the active theme.
export function createListingRowStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Vertical stack: header, then the horizontal rail.
    container: {
      gap: theme.spacing.md,
    },
    // Header inset matches the screen's horizontal padding.
    header: {
      paddingHorizontal: theme.spacing.lg,
    },
    // Full-bleed rail: cards start and end flush with the screen padding, with
    // even gaps between so the row reads as a single edge-to-edge strip.
    railContent: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
  });
}
