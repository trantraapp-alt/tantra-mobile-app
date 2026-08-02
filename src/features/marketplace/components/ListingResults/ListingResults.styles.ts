// Style factory for ListingResults.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds ListingResults styles from the active theme.
export function createListingResultsStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Bounded parent required by FlashList.
    container: {
      flex: 1,
    },
    // Grid padding; the extra bottom room clears the tab bar / footer.
    content: {
      paddingHorizontal: theme.spacing.sm,
      paddingBottom: theme.spacing.xxxl,
    },
    // One grid cell (two per row); the inner padding is the inter-card gap.
    cell: {
      flex: 1,
      paddingHorizontal: theme.spacing.xs,
      paddingBottom: theme.spacing.md,
    },
    // Footer "loading more" spinner.
    footer: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    // Centered container for the loading / empty / error states.
    state: {
      paddingVertical: theme.spacing.giant,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
