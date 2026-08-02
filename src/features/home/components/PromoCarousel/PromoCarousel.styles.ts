// Style factory for the PromoCarousel.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Soft white highlights layered over the gradient for depth.
const DECOR_LARGE = 'rgba(255, 255, 255, 0.14)';
const DECOR_SMALL = 'rgba(255, 255, 255, 0.10)';
// The CTA pill sits on colored gradients, so it is a fixed white pill with dark
// ink — independent of the light/dark theme.
const CTA_PILL_BG = 'rgba(255, 255, 255, 0.96)';
const CTA_INK = '#1B1630';

// Builds PromoCarousel styles from the active theme.
export function createPromoCarouselStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Measures the available width for paging.
    measure: {
      width: '100%',
    },
    // One page: full container width, banner inset by the screen padding.
    slide: {
      paddingHorizontal: theme.spacing.lg,
    },
    // The banner surface — clips the image + scrim to its rounded corners.
    banner: {
      borderRadius: theme.cardRadius.xl,
      overflow: 'hidden',
      justifyContent: 'flex-end',
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Absolutely-filled banner image.
    image: {
      ...StyleSheet.absoluteFillObject,
    },
    // Large soft highlight, upper-right (clipped by the banner's rounded frame).
    decorCircle: {
      position: 'absolute',
      top: -44,
      right: -30,
      width: 150,
      height: 150,
      borderRadius: theme.radius.pill,
      backgroundColor: DECOR_LARGE,
    },
    // Second, smaller highlight lower down for layered depth.
    decorCircleSmall: {
      position: 'absolute',
      bottom: -24,
      right: 70,
      width: 96,
      height: 96,
      borderRadius: theme.radius.pill,
      backgroundColor: DECOR_SMALL,
    },
    // Text + CTA overlay, bottom-aligned.
    content: {
      padding: theme.spacing.lg,
      gap: theme.spacing.xxs,
    },
    // Raised white CTA pill with a trailing chevron.
    ctaPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      alignSelf: 'flex-start',
      marginTop: theme.spacing.sm,
      backgroundColor: CTA_PILL_BG,
      borderRadius: theme.radius.pill,
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    // CTA label ink (fixed dark, since the pill is always white).
    ctaText: {
      color: CTA_INK,
    },
    // Dot indicator row.
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.md,
    },
    dot: {
      height: 6,
      borderRadius: theme.radius.pill,
    },
    dotActive: {
      width: 18,
      backgroundColor: theme.colors.primary,
    },
    dotInactive: {
      width: 6,
      backgroundColor: theme.colors.border,
    },
    // Pressed feedback on a banner.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
