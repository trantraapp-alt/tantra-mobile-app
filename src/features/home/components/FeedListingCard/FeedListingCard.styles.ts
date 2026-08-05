// Style factory for the FeedListingCard (Flipkart / OLX-style grid tile).
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds FeedListingCard styles from the active theme.
export function createFeedListingCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // The tile: a bordered, clipped card so each listing reads as its own unit.
    card: {
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    // Fills the parent cell width (grid layout) when no fixed width is given.
    flex: {
      flex: 1,
    },
    // Square image frame with a neutral placeholder background.
    imageWrap: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    // Top-left discount pill.
    discountBadge: {
      position: 'absolute',
      top: theme.spacing.sm,
      left: theme.spacing.sm,
      backgroundColor: theme.colors.info,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
    },
    // Top-right premium ribbon (tinted with the plan's highlight color).
    premiumRibbon: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
    },
    // Top-right status pill (My Listings only). Mirrors the discount pill's
    // metrics so the two corners align; the background color is set inline
    // from the status tone.
    statusBadge: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
    },
    // Grey scrim + rotated stamp for a sold listing.
    soldOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
    },
    soldStamp: {
      borderWidth: 2,
      borderColor: theme.colors.onPrimary,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xxs,
      transform: [{ rotate: '-8deg' }],
    },
    // Text block below the image.
    body: {
      padding: theme.spacing.md,
      gap: theme.spacing.xxs,
    },
    // Distance-from-buyer shown as a small pill just under the price, on the
    // left (alignSelf keeps it hugging its content instead of full width).
    distancePill: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
      marginTop: theme.spacing.xxs,
    },
    // Title sits a touch below the hero price.
    title: {
      marginTop: theme.spacing.xxs,
    },
    description: {
      marginTop: theme.spacing.xxs / 2,
      // Always reserve two lines so a 1-line and a 2-line description keep the
      // content below them (location, tags) aligned across cards in a row.
      minHeight: theme.typography.caption.lineHeight * 2,
    },
    // Locality + distance line with a leading pin.
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      marginTop: theme.spacing.xs,
    },
    metaText: {
      flex: 1,
    },
    // Small trailing tags (Rent / Negotiable).
    tagsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xs,
    },
    tag: {
      borderRadius: theme.radius.xs,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs / 2,
    },
    tagRent: {
      backgroundColor: theme.colors.primaryLight,
    },
    // Negotiable = green (success), Not Negotiable = amber (warning).
    tagNegotiable: {
      backgroundColor: theme.colors.success,
    },
    tagNotNegotiable: {
      backgroundColor: theme.colors.warning,
    },
    // Optional owner-action row pinned at the bottom (My Listings).
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    // Pressed feedback on the whole card.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
