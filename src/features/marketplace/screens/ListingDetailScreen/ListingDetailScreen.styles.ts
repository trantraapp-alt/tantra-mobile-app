// Style factory for the buyer ListingDetailScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds ListingDetailScreen styles from the active theme.
export function createListingDetailStyles(theme: AppTheme) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    content: {
      paddingBottom: theme.spacing.xxl,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    // Emoji/placeholder hero when there are no images.
    heroPlaceholder: {
      width: '100%',
      aspectRatio: 4 / 3,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Engagement stats strip under the hero.
    statsRow: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.primaryLight,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    // A padded content block.
    section: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    sectionBordered: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    sectionTitle: {
      textTransform: 'uppercase',
      marginBottom: theme.spacing.xxs,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing.sm,
      flexWrap: 'wrap',
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
    // Attribute key/value grid.
    attrsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    attrItem: {
      width: '47%',
      flexGrow: 1,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.sm,
      gap: 1,
    },
    // Seller card.
    sellerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.cardRadius.lg,
      padding: theme.spacing.md,
    },
    sellerAvatar: {
      width: theme.sizing.avatarMd,
      height: theme.sizing.avatarMd,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sellerInfo: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // Sticky bottom CTA bar.
    cta: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    ctaContact: {
      flex: 1,
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
