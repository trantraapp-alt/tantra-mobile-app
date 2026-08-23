// Style factory for the ListingDetailScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds listing detail screen styles from the active theme.
export function createListingDetailScreenStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Centered container for loading/error states.
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    // Scroll content: no horizontal padding — every block owns its own gutter
    // so the gallery can run edge to edge.
    // The shared body paints its own cards on this muted ground, exactly as
    // the buyer page does.
    scroll: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
    },
    scrollBody: {
      paddingBottom: theme.spacing.xxl,
    },
    // Owner-only record card — same geometry as the shared body's cards, so it
    // reads as one more card in the same stack.
    recordCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.lg,
      gap: theme.spacing.xs,
      ...theme.shadows.low,
    },
    recordHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    // Status badge overlay. Bottom-left is the one corner free of carousel
    // chrome (counter top-right, dots bottom-center, arrows center left/right).
    heroBadge: {
      position: 'absolute',
      left: theme.spacing.md,
      bottom: theme.spacing.md,
    },
    // Two-column label/value row. Both columns are left-aligned: Hindi labels
    // wrap to two lines and a right-ragged value beside a left-ragged label
    // reads as a broken column. Values are never truncated.
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    // Label column — narrower, because the value is the payload.
    rowLabel: {
      flex: 42,
    },
    // Value column.
    rowValue: {
      flex: 58,
    },
    // Inline notice replacing the metadata-driven blocks when the schema fails.
    formErrorCard: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    // Sticky action shelf — identical to DynamicListingForm's footer so create,
    // preview and edit all feel like the same surface.
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    // Loading skeleton block mirroring the real page rhythm.
    skeletonBlock: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    // 4:3 box reserving the gallery's true height while it loads.
    skeletonHero: {
      width: '100%',
      aspectRatio: 4 / 3,
    },
  });
}
