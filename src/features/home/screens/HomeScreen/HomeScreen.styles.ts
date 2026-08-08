// Style factory for the HomeScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds home screen styles from the active theme.
export function createHomeStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Scroll content: vertical rhythm only. Horizontal insets are owned by each
    // section so listing rails can run edge to edge. No top padding so the mandi
    // ticker sits flush under the fixed header.
    content: {
      paddingBottom: theme.spacing.xxxl,
      gap: theme.spacing.lg,
    },
    // Brand footer at the end of the feed.
    footer: {
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      gap: theme.spacing.xxs,
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.sm,
    },
    footerBrand: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    // The padded top block: brand bar, greeting and search.
    topBlock: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    // Brand top bar row.
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    // Logo + wordmark lockup.
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Two-tone "Tantra" wordmark.
    wordmark: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    // Trailing action icons in the top bar.
    topActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Greeting text on the left, location chip on the right.
    greetingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    greeting: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // A module section wrapper: header, chips, rail stacked with a tight gap.
    section: {
      gap: theme.spacing.md,
    },
    // Inset for a section header rendered directly by the screen.
    sectionHeaderWrap: {
      paddingHorizontal: theme.spacing.lg,
    },
    // Horizontal rail of featured business cards.
    businessRail: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    // Two-column grid for the recent listings section.
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    // A single grid cell (two per row, accounting for the gap between them).
    gridCell: {
      width: '48%',
    },
    // Centered container for the error / empty states.
    center: {
      paddingVertical: theme.spacing.giant,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // --- Skeleton placeholders (initial load) ---
    skeleton: {
      gap: theme.spacing.xl,
    },
    skelBase: {
      backgroundColor: theme.colors.skeletonBase,
    },
    skelBanner: {
      height: 150,
      marginHorizontal: theme.spacing.lg,
      borderRadius: theme.cardRadius.xl,
    },
    skelCircleRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    skelCircleItem: {
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    skelCircle: {
      width: 60,
      height: 60,
      borderRadius: theme.radius.pill,
    },
    skelCircleLabel: {
      width: 44,
      height: 8,
      borderRadius: theme.radius.pill,
    },
    skelHeader: {
      width: 160,
      height: 18,
      marginHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.pill,
    },
    skelCardRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    skelCard: {
      width: 176,
      height: 210,
      borderRadius: theme.cardRadius.lg,
    },
    skelGroup: {
      gap: theme.spacing.md,
    },
  });
}
