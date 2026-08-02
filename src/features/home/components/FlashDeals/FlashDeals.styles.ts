// Style factory for the FlashDeals promo card.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Translucent white overlays layered on the dark (primaryDark) card. These sit
// on top of a solid colored surface, so — like the PromoCarousel decor — they
// are fixed rgba overlays rather than theme tokens.
const CARD_TINT = 'rgba(255, 255, 255, 0.06)';
const CARD_BORDER = 'rgba(255, 255, 255, 0.12)';
const IMAGE_TINT = 'rgba(255, 255, 255, 0.05)';
const PILL_BG = 'rgba(255, 255, 255, 0.10)';
// Struck-through old price: white at ~40% opacity.
const OLD_PRICE = 'rgba(255, 255, 255, 0.40)';

// Builds FlashDeals styles from the active theme.
export function createFlashDealsStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Dark rounded promo card, inset from the screen edges.
    card: {
      marginHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.primaryDark,
      borderRadius: theme.cardRadius.lg,
      padding: theme.spacing.lg,
    },
    // Title (left) + live countdown pill (right).
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    // Secondary-tinted countdown pill wrapping the HH : MM : SS blocks.
    countdown: {
      alignItems: 'center',
      backgroundColor: PILL_BG,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
    },
    // Row of two-digit numbers separated by colons.
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    // A single two-digit time block; fixed width keeps columns aligned.
    timeNum: {
      width: 26,
      textAlign: 'center',
    },
    // Colon separator between blocks; fixed width mirrors the label spacer.
    timeColon: {
      width: 8,
      textAlign: 'center',
    },
    // Row of tiny Hrs/Min/Sec labels beneath the numbers.
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xxs,
    },
    // A label sitting under its number block (same width for alignment).
    timeLabel: {
      width: 26,
      textAlign: 'center',
    },
    // Spacer mirroring a colon's width so labels line up under numbers.
    labelSpacer: {
      width: 8,
    },
    // Horizontal deal rail: inter-card spacing only (card padding insets it).
    rail: {
      gap: theme.spacing.md,
    },
    // A single flash-deal card.
    dealCard: {
      width: 150,
      backgroundColor: CARD_TINT,
      borderRadius: theme.cardRadius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: CARD_BORDER,
      overflow: 'hidden',
    },
    // Emoji "image" area with a subtle inner tint.
    imageArea: {
      height: 88,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: IMAGE_TINT,
    },
    // Large centered product emoji.
    emoji: {
      fontSize: 40,
      lineHeight: 48,
    },
    // Red discount badge, pinned to the image's top-right.
    badge: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      backgroundColor: theme.colors.danger,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
    },
    // Discount badge text spacing.
    badgeText: {
      letterSpacing: 0.3,
    },
    // Name + price block below the image.
    dealBody: {
      padding: theme.spacing.sm,
      gap: theme.spacing.xxs,
    },
    // Current price beside the struck old price.
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: theme.spacing.xs,
    },
    // Bold current price.
    price: {
      fontWeight: theme.fontWeight.bold,
    },
    // Struck-through original price.
    oldPrice: {
      color: OLD_PRICE,
      textDecorationLine: 'line-through',
    },
    // Pressed feedback on a deal card.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
