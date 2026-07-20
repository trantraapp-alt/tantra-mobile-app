// Style factory for the TextField component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds text field styles from the active theme.
export function createTextFieldStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Outer field container.
    container: {
      width: '100%',
    },
    // Label above the input.
    label: {
      marginBottom: theme.spacing.xs,
    },
    // Row wrapping icons and the input (height comes from the size preset).
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.lg,
    },
    // Size presets controlling the field height.
    size_xs: {
      height: theme.sizing.inputHeightXs,
    },
    size_sm: {
      height: theme.sizing.inputHeightSm,
    },
    size_md: {
      height: theme.sizing.inputHeight,
    },
    size_lg: {
      height: theme.sizing.inputHeightLg,
    },
    // Focused border treatment.
    focused: {
      borderColor: theme.colors.primary,
    },
    // Error border treatment.
    errored: {
      borderColor: theme.colors.danger,
    },
    // Disabled treatment.
    disabled: {
      opacity: theme.opacity.disabled,
    },
    // The text input itself.
    input: {
      flex: 1,
      color: theme.colors.textPrimary,
      ...theme.typography.body,
      paddingVertical: theme.spacing.none,
    },
    // Leading icon spacing.
    leftIcon: {
      marginRight: theme.spacing.sm,
    },
    // Trailing icon spacing.
    rightIcon: {
      marginLeft: theme.spacing.sm,
    },
    // Helper / error message below the input.
    message: {
      marginTop: theme.spacing.xs,
    },
  });
}
