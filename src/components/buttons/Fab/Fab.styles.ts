// Style factory for the Fab component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds floating-action-button styles from the active theme.
export function createFabStyles(theme: AppTheme) {
  // A comfortable 56px tap target (Material FAB size), from theme tokens.
  const size = theme.sizing.avatarMd + theme.spacing.md;
  return StyleSheet.create({
    // Circular, elevated button pinned to the bottom-right (bottom set inline
    // from the safe-area inset).
    fab: {
      position: 'absolute',
      right: theme.spacing.lg,
      width: size,
      height: size,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      ...theme.shadows.high,
    },
    // Pressed-state feedback.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
