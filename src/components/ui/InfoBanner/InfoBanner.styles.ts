// Style factory for the InfoBanner component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds info banner styles from the active theme.
export function createInfoBannerStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Tinted row accented on the left by the tone color.
    base: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderLeftWidth: 3,
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Text column (title + message).
    text: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
  });
}
