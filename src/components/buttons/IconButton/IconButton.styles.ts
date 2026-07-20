// Style factory for the IconButton component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds icon button styles keyed by size from the active theme.
export function createIconButtonStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Shared circular base.
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.pill,
    },
    // Filled surface background.
    filled: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Pressed feedback.
    pressed: {
      opacity: theme.opacity.pressed,
    },
    // Disabled state.
    disabled: {
      opacity: theme.opacity.disabled,
    },
    // Small touch target.
    size_sm: {
      width: theme.sizing.iconXl,
      height: theme.sizing.iconXl,
    },
    // Medium touch target.
    size_md: {
      width: theme.sizing.minTouchTarget,
      height: theme.sizing.minTouchTarget,
    },
    // Large touch target.
    size_lg: {
      width: theme.sizing.iconXxl + theme.spacing.sm,
      height: theme.sizing.iconXxl + theme.spacing.sm,
    },
  });
}
