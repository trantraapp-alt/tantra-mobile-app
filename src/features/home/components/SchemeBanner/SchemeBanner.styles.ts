// Style factory for the SchemeBanner promotional row.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds SchemeBanner styles from the active theme.
export function createSchemeBannerStyles(theme: AppTheme) {
  return StyleSheet.create({
    // The full-width tappable banner card on an info background.
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      marginHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.cardRadius.lg,
      backgroundColor: theme.colors.info,
    },
    // Leading flag emoji sized up as a small icon.
    emoji: {
      fontSize: theme.fontSize.xxl,
      lineHeight: theme.lineHeight.xxl,
    },
    // Middle text column that expands to fill available width.
    body: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // Emphasized banner headline.
    title: {
      fontWeight: theme.fontWeight.bold,
    },
    // Muted supporting line rendered as ~75% white.
    desc: {
      opacity: 0.75,
    },
    // Trailing chevron affordance.
    chevron: {
      fontWeight: theme.fontWeight.regular,
    },
    // Pressed feedback applied to the inner banner view.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
