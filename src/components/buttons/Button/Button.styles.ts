// Style factory for the Button component covering variants and sizes.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds button styles keyed by variant and size from the active theme.
export function createButtonStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Shared base layout.
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.lg,
    },
    // Full-width modifier.
    fullWidth: {
      alignSelf: 'stretch',
    },
    // Pressed feedback.
    pressed: {
      opacity: theme.opacity.pressed,
    },
    // Disabled / loading state.
    disabled: {
      opacity: theme.opacity.disabled,
    },
    // Content row wrapping icons and the label.
    contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    // Spacing for a leading icon.
    iconLeft: {
      marginRight: theme.spacing.sm,
    },
    // Spacing for a trailing icon.
    iconRight: {
      marginLeft: theme.spacing.sm,
    },

    // Sizes.
    size_sm: {
      height: theme.sizing.buttonHeightSm,
    },
    size_md: {
      height: theme.sizing.buttonHeightMd,
    },
    size_lg: {
      height: theme.sizing.buttonHeightLg,
    },

    // Variants. Solid variants carry a low shadow so the filled CTA reads as a
    // raised, clearly-bounded surface (safe on Android: opaque background means
    // the elevation renders as a clean shadow, not a gray box).
    variant_primary: {
      backgroundColor: theme.colors.primary,
      ...theme.shadows.low,
    },
    variant_secondary: {
      backgroundColor: theme.colors.secondary,
      ...theme.shadows.low,
    },
    variant_outline: {
      backgroundColor: theme.colors.transparent,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    variant_ghost: {
      backgroundColor: theme.colors.transparent,
    },
    variant_danger: {
      backgroundColor: theme.colors.danger,
      ...theme.shadows.low,
    },
  });
}
