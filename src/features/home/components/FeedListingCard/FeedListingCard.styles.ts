// Style factory for the FeedListingCard.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Dark translucent scrim used behind image chips so white text stays legible on
// any photo. Fixed (not theme-derived) because it sits on imagery, not chrome.
const CHIP_SCRIM = 'rgba(20, 16, 38, 0.72)';

// Builds FeedListingCard styles from the active theme.
export function createFeedListingCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Clips the square image to the card's rounded corners.
    clip: {
      overflow: 'hidden',
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
      backgroundColor: theme.colors.danger,
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
    // Bottom-left distance chip over the image.
    distanceChip: {
      position: 'absolute',
      bottom: theme.spacing.sm,
      left: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      backgroundColor: CHIP_SCRIM,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
    },
    // Grey scrim + stamp for a sold listing.
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
    // Price + optional quantity on one baseline.
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.xs,
    },
    quantity: {
      flexShrink: 0,
    },
    // Two-line item description under the title.
    description: {
      marginTop: theme.spacing.xxs / 2,
    },
    // Locality line with a leading pin.
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    locationText: {
      flex: 1,
    },
    // Small trailing tags (Rent / Negotiable).
    tagsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xxs,
    },
    tag: {
      borderRadius: theme.radius.xs,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs / 2,
    },
    tagRent: {
      backgroundColor: theme.colors.primaryLight,
    },
    tagNegotiable: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Pressed feedback on the whole card.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
