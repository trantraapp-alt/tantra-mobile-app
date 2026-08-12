// Style factory for the full-width marketplace ListingCard: a tall photo with a
// discount pill + wishlist heart, a white wave that curves the photo into the
// body, a floating category badge, then the price / distance / attribute chips /
// negotiability pill and a seller row. One card per row.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Height (points) of the white wave that bridges the photo and the body. Kept
// shallow so there's little empty space between the photo and the title.
export const LISTING_CARD_WAVE_HEIGHT = 30;

// Builds ListingCard styles from the active theme.
export function createListingCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // The card clips the photo corners; the Card surface adds bg / border /
    // shadow.
    card: {
      overflow: 'hidden',
    },
    // Whole-card press feedback.
    pressed: {
      opacity: theme.opacity.pressed,
    },
    // Photo frame with a neutral placeholder behind it. A taller photo; the body
    // spacing below is trimmed to keep the overall card height about the same.
    imageWrap: {
      width: '100%',
      aspectRatio: 1.2,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    // Discount badge on the photo, bottom-right, sitting just above the wave.
    discountBadge: {
      position: 'absolute',
      right: theme.spacing.sm,
      bottom: LISTING_CARD_WAVE_HEIGHT + theme.spacing.xxs,
      zIndex: 2,
      backgroundColor: theme.colors.success,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
    },
    // Top-right circular wishlist button.
    heartButton: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.medium,
    },
    // The white wave drawn over the bottom of the photo, blending into the body.
    wave: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: -1,
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
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
      transform: [{ rotate: '-8deg' }],
    },
    // Content block below the photo. Minimal top/bottom padding so the taller
    // photo doesn't push the overall card height up.
    body: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.xxs,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.xxs,
    },
    // Short description under the title; one line reserved so rows align.
    description: {
      marginTop: theme.spacing.xxs / 2,
      minHeight: theme.typography.caption.lineHeight,
    },
    // Price row: hero price + struck-through original. Fixed height keeps the
    // rows below it aligned whether a price or "Ask price" is shown.
    priceRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing.xs,
      minHeight: theme.typography.h4.lineHeight,
    },
    compareAt: {
      textDecorationLine: 'line-through',
    },
    // Address line with a leading pin; one line reserved for alignment.
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      minHeight: theme.typography.caption.lineHeight,
    },
    // Lets the location shrink and ellipsize on one line instead of wrapping.
    metaText: {
      flex: 1,
    },
    // Attribute chips (quantity, organic…) kept to a single reserved row so
    // every card is the same height.
    chipsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'nowrap',
      overflow: 'hidden',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xxs,
      minHeight: theme.typography.label.lineHeight + theme.spacing.xs * 2 + 2,
    },
    chip: {
      flexShrink: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    // Negotiability pill (red = firm, green = negotiable). Sits inline in the
    // tags row next to the quantity chip; a touch smaller than the chip.
    negotiablePill: {
      flexShrink: 1,
      minWidth: 0,
      alignSelf: 'center',
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
    },
    // Extra-small label inside the negotiability pill so "Not Negotiable" fits.
    negotiablePillText: {
      fontSize: 10,
      lineHeight: 13,
      letterSpacing: 0.2,
    },
    // Thin divider before the seller row.
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    // Seller identity + trust shield.
    sellerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sellerName: {
      flex: 1,
    },
  });
}
