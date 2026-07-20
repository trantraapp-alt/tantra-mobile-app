// Style factory for the FormBanner component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds inline form banner styles from the active theme.
export function createFormBannerStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Row container with a colored left accent (color applied inline).
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderLeftWidth: theme.spacing.xs,
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Message text fills the remaining width.
    text: {
      flex: 1,
    },
  });
}
