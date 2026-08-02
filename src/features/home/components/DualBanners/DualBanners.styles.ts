// Style factory for the DualBanners row.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Fixed translucent-white overlay for the decorative circle drawn on top of the
// colored banner fills. A raw rgba constant is used because the decoration must
// stay the same faint white regardless of the active color scheme.
const DECORATION_FILL = 'rgba(255, 255, 255, 0.08)';

// Builds DualBanners styles from the active theme.
export function createDualBannersStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Two-up row that owns its own horizontal padding so it runs edge-to-edge.
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    // Each tappable cell claims an equal share of the row width.
    pressable: {
      flex: 1,
    },
    // A single rounded mini banner: fills its cell, clips the decoration and
    // bottom-aligns its text content.
    banner: {
      flex: 1,
      minHeight: 80,
      borderRadius: theme.cardRadius.lg,
      overflow: 'hidden',
      padding: theme.spacing.md,
      justifyContent: 'flex-end',
    },
    // Left banner: primary brand fill.
    bannerLeft: {
      backgroundColor: theme.colors.primary,
    },
    // Right banner: secondary accent fill.
    bannerRight: {
      backgroundColor: theme.colors.secondary,
    },
    // Decorative translucent circle floated into the top-right corner.
    circle: {
      position: 'absolute',
      top: -theme.spacing.xl,
      right: -theme.spacing.md,
      width: 96,
      height: 96,
      borderRadius: theme.radius.full,
      backgroundColor: DECORATION_FILL,
    },
    // Text stack sitting above the decoration.
    content: {
      gap: theme.spacing.xxs,
    },
    // Pressed feedback.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
