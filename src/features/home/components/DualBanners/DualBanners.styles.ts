// Style factory for the DualBanners (deals) row.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Faint translucent-white fills for the decorative blob and the count pill drawn
// on top of the colored banner, plus a dark scrim laid over an admin background
// image for legibility. Raw rgba constants are used because these overlays must
// stay constant regardless of the accent color / image underneath them.
const BLOB_FILL = 'rgba(255, 255, 255, 0.12)';
const PILL_FILL = 'rgba(255, 255, 255, 0.2)';
const SCRIM_FILL = 'rgba(0, 0, 0, 0.32)';

// Builds DualBanners styles from the active theme.
export function createDualBannersStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Header inset matches the screen's horizontal padding. The SectionHeader
    // supplies its own bottom margin, so the title-to-grid gap needs no extra.
    header: {
      paddingHorizontal: theme.spacing.lg,
    },
    // Wrapping row (two banners per line) that owns its own horizontal padding so
    // it runs edge-to-edge.
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    // Each tappable cell takes half the row width (two per line).
    pressable: {
      width: '48%',
    },
    // A single compact rounded banner: fixed height, clips the gradient, blob and
    // watermark. The gradient fill is drawn by an absolutely-positioned Svg.
    banner: {
      height: 84,
      borderRadius: theme.cardRadius.lg,
      overflow: 'hidden',
    },
    // Soft translucent circle floated into the top-right for depth.
    blob: {
      position: 'absolute',
      top: -theme.spacing.xl,
      right: -theme.spacing.md,
      width: 88,
      height: 88,
      borderRadius: theme.radius.full,
      backgroundColor: BLOB_FILL,
    },
    // Oversized emoji artwork, floated off the bottom-right corner and dimmed so
    // it reads as a background graphic rather than a label.
    watermark: {
      position: 'absolute',
      right: -6,
      bottom: -14,
      fontSize: 64,
      opacity: 0.24,
    },
    // Foreground row: text column on the left, chevron affordance on the right.
    bannerContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    // Title + price stack, taking the remaining width.
    textCol: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // Slightly softened price line so the title stays dominant.
    priceText: {
      opacity: 0.92,
    },
    // Dark scrim laid over an admin background image so text stays legible.
    scrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: SCRIM_FILL,
    },
    // Rounded translucent pill: listing count next to a "tap" chevron.
    countPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      paddingLeft: theme.spacing.sm,
      paddingRight: theme.spacing.xxs,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.radius.full,
      backgroundColor: PILL_FILL,
    },
    // Count number sits tight inside the pill.
    countText: {
      letterSpacing: 0.3,
    },
    // Pressed feedback.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
