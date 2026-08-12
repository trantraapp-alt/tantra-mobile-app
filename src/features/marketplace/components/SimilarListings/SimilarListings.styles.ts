// Style factory for the SimilarListings rail.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds SimilarListings styles from the active theme.
export function createSimilarListingsStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Vertical stack: header, then the horizontal rail.
    container: {
      gap: theme.spacing.md,
    },
    // Header inset matches the screen's horizontal padding.
    header: {
      paddingHorizontal: theme.spacing.lg,
    },
    // Full-bleed rail: cards start/end flush with the screen padding, even gaps
    // between so the row reads as one edge-to-edge strip.
    rail: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
  });
}
