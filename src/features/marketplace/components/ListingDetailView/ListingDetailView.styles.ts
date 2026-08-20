// Style factory for the shared ListingDetailView.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds shared listing-detail view styles from the active theme.
export function createListingDetailViewStyles(theme: AppTheme) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    // Scroll content on a subtle page background so the white cards lift off it.
    content: {
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    // Positioning context for the gallery + its status badge overlay.
    hero: {
      position: 'relative',
    },
    // Status badge overlay, bottom-left (clear of the carousel chrome).
    heroBadge: {
      position: 'absolute',
      left: theme.spacing.md,
      bottom: theme.spacing.md,
    },
    // A rounded content card, inset from the screen edges.
    card: {
      marginHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    // Overline + reference-id row: eyebrow label left, ref id right.
    overlineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    // Section heading row: an optional icon beside the uppercase title.
    sectionHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.xxs,
    },
    // Uppercase section heading text.
    sectionTitle: {
      textTransform: 'uppercase',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    title: {
      flexShrink: 1,
    },
    tagsRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      flexWrap: 'wrap',
    },
    metaRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    // Engagement stats: a subtle divided footer inside the hero card.
    statsRow: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      alignItems: 'center',
      flexWrap: 'wrap',
      paddingTop: theme.spacing.sm,
      marginTop: theme.spacing.xxs,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    // Inline label/value row: label left, value right, hairline between rows.
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    rowLabel: {
      flexShrink: 1,
    },
    rowValue: {
      flexShrink: 1,
      alignItems: 'flex-end',
    },
    rowValueText: {
      textAlign: 'right',
    },
    // Full-width stacked row for long text / multi-value answers.
    stackedRow: {
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xxs,
    },
    rowDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    // Sticky footer bar holding the primary action.
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
  });
}
