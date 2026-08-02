// Style factory for the SearchResultsScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds SearchResultsScreen styles from the active theme.
export function createSearchResultsStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Back button + search field row.
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
    },
    searchInput: {
      flex: 1,
    },
    // Listings / Sellers segmented tabs.
    tabs: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceVariant,
    },
    tabActive: {
      backgroundColor: theme.colors.primary,
    },
    // Body container (bounded for the FlashLists).
    body: {
      flex: 1,
    },
    // Sellers list padding + per-card cell.
    sellersContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    // Centered container for loading / empty / recent states.
    state: {
      flex: 1,
      paddingVertical: theme.spacing.giant,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Recent searches list.
    recent: {
      paddingHorizontal: theme.spacing.lg,
    },
    recentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    recentLabel: {
      flex: 1,
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
