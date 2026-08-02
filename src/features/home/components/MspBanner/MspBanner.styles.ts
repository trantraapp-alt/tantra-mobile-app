// Style factory for the MspBanner.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds MspBanner styles from the active theme.
export function createMspBannerStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Outer touch target owns the banner's horizontal margin so it insets from
    // the screen edges.
    pressable: {
      marginHorizontal: theme.spacing.lg,
    },
    // Tinted horizontal banner: pale primary fill with an accent left rule.
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.primaryLight,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.secondary,
      borderRadius: theme.cardRadius.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    // Big leading landmark emoji.
    emoji: {
      fontSize: theme.fontSize.xxl,
      lineHeight: theme.lineHeight.xxl,
    },
    // Flexible middle text stack.
    content: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // Trailing chevron affordance.
    chevron: {
      fontSize: theme.fontSize.xxxl,
      lineHeight: theme.lineHeight.xxl,
    },
    // Pressed feedback.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
