// Style factory for the FilterChipsBar.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds FilterChipsBar styles from the active theme.
export function createFilterChipsBarStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Vertical stack: optional result count, then the chip rail.
    container: {
      paddingTop: theme.spacing.xs,
    },
    // Result-count line above the chips, inset to the screen padding.
    count: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxs,
    },
    // Horizontal rail owning its own edge padding so it scrolls flush.
    rail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    // A pill chip: label + chevron, bordered on the surface.
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    // Active chip: violet tint + violet outline.
    chipActive: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    // Reset control: a borderless violet action.
    reset: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    // Pressed feedback.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
