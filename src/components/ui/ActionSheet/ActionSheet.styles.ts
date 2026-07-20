// Style factory for the ActionSheet component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds action sheet styles from the active theme.
export function createActionSheetStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Stacked action rows.
    actions: {
      gap: theme.spacing.sm,
    },
    // A single tappable action row (card-like).
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Tinted circular icon badge (color applied inline).
    iconWrap: {
      width: theme.sizing.avatarSm,
      height: theme.sizing.avatarSm,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Cancel row, styled as an outlined button.
    cancel: {
      alignItems: 'center',
      justifyContent: 'center',
      height: theme.sizing.buttonHeightMd,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  });
}
