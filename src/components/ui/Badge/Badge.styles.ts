// Style factory for the Badge component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds badge styles keyed by tone from the active theme.
export function createBadgeStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Shared base layout.
    base: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.xs,
    },

    // Tone backgrounds.
    tone_primary: { backgroundColor: theme.colors.primaryLight },
    tone_success: { backgroundColor: theme.colors.success },
    tone_warning: { backgroundColor: theme.colors.warning },
    tone_danger: { backgroundColor: theme.colors.danger },
    tone_neutral: { backgroundColor: theme.colors.surfaceVariant },

    // Tone text colors.
    text_primary: { color: theme.colors.primary },
    text_success: { color: theme.colors.onPrimary },
    text_warning: { color: theme.colors.onPrimary },
    text_danger: { color: theme.colors.onPrimary },
    text_neutral: { color: theme.colors.textSecondary },
  });
}
