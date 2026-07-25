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
    scrollContent: {
      paddingBottom: theme.spacing.xxl,
    },
    // Positioning context for the gallery and its status badge overlay. It has
    // no size of its own: the carousel's `aspectRatio` prop defines the height,
    // so there is no aspect conflict with a wrapper.
    hero: {
      position: 'relative',
    },
    // Status badge overlay. Bottom-left is the one corner free of carousel
    // chrome (counter top-right, dots bottom-center, arrows center left/right).
    heroBadge: {
      position: 'absolute',
      left: theme.spacing.md,
      bottom: theme.spacing.md,
    },
    // A full-bleed content block on the page background.
    block: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    // Full-bleed separator band between blocks.
    band: {
      height: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Identity block: eyebrow, title and listing reference.
    identity: {
      gap: theme.spacing.xs,
    },
    // Recessed full-bleed strip carrying the price and the quantity — the pivot
    // between the poster above and the spec sheet below.
    priceBand: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    // Left column of the price band (price, or quantity when there is no price).
    priceColumn: {
      gap: theme.spacing.xxs,
      alignItems: 'flex-start',
    },
    // Right column of the price band; yields width to the price, never the
    // other way round.
    quantityColumn: {
      gap: theme.spacing.xxs,
      alignItems: 'flex-end',
      flexShrink: 1,
    },
    // Section / block heading.
    blockTitle: {
      marginBottom: theme.spacing.sm,
    },
    // Heading with a leading icon (location).
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
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
    // Full-width row for long text, paragraphs and multi-select answers.
    stackedRow: {
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    // Yes/No value with its leading icon.
    booleanValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    // Wrapping container for inert multi-select pills.
    tagWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    // One inert value pill. Deliberately not a Chip: Chip requires `onPress`
    // and would put a fake tap target on a read-only page.
    tag: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Stacked address lines.
    addressLines: {
      gap: theme.spacing.xxs,
    },
    // Contact number row (non-interactive: this is the seller's own listing).
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    // Coordinates line under the address.
    coordinates: {
      marginTop: theme.spacing.sm,
    },
    // "Read more" toggle under a clamped description.
    readMore: {
      marginTop: theme.spacing.sm,
    },
    // Gap between multiple description paragraphs.
    descriptionGroup: {
      gap: theme.spacing.lg,
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
