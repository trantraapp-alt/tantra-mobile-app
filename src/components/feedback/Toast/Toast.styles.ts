// Style factory for the Toast component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds toast styles from the active theme.
export function createToastStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Absolute overlay pinned near the top (top offset applied inline).
    wrapper: {
      position: 'absolute',
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      zIndex: 1000,
    },
    // Shadow host: carries the elevation without clipping it.
    shadowHost: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      ...theme.shadows.high,
    },
    // Card surface clipping the progress bar to the rounded corners.
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      overflow: 'hidden',
    },
    // Colored circular icon badge (background color applied inline).
    iconBadge: {
      width: theme.sizing.avatarSm,
      height: theme.sizing.avatarSm,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Message text fills the remaining width.
    message: {
      flex: 1,
    },
    // Countdown progress bar anchored at the bottom edge, shrinking from left.
    progress: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: theme.spacing.xs,
      transformOrigin: 'left',
    },
  });
}
