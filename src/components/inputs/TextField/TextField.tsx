// Themed text input with label, helper text, error state and optional icons.
import { cloneElement, forwardRef, isValidElement, useCallback, useState } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';

// Event parameter types derived from the TextInput props for version resilience.
type FocusEvent = Parameters<NonNullable<TextInputProps['onFocus']>>[0];
type BlurEvent = Parameters<NonNullable<TextInputProps['onBlur']>>[0];

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { FieldLabel } from '../FieldLabel';
import { useKeyboardAware } from '../KeyboardAwareScrollView/KeyboardAwareContext';
import { createTextFieldStyles } from './TextField.styles';

// Height presets for the text field.
export type TextFieldSize = 'xs' | 'sm' | 'md' | 'lg';

// Icon size presets: xxs (very small), xs (extra small), sm (small), lg (large).
export type TextFieldIconSize = 'xxs' | 'xs' | 'sm' | 'lg';

// Props for the TextField component.
export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  // Field label shown above the input.
  label?: string;
  // Marks the label with a red asterisk (does not itself enforce validation).
  required?: boolean;
  // Height preset controlling how tall the field is (defaults to 'md').
  size?: TextFieldSize;
  // Sizes the left/right icons; when omitted, each icon keeps its own size.
  iconSize?: TextFieldIconSize;
  // Error message; when present the field renders in an error state.
  error?: string;
  // Helper text shown below the input when there is no error.
  helperText?: string;
  // Optional element rendered inside the field on the left.
  leftIcon?: React.ReactNode;
  // Optional element rendered inside the field on the right.
  rightIcon?: React.ReactNode;
}

// Renders a themed, accessible text field with validation styling.
export const TextField = forwardRef<TextInput, TextFieldProps>(
  function TextField(
    {
      label,
      required,
      size = 'md',
      iconSize,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onFocus,
      onBlur,
      editable = true,
      ...rest
    },
    ref,
  ) {
    const theme = useTheme();
    const styles = useThemedStyles(createTextFieldStyles);
    const [isFocused, setIsFocused] = useState(false);
    // When inside a KeyboardAwareScrollView, lift this field above the keyboard
    // on focus (covers moving between fields while the keyboard stays open).
    const keyboardAware = useKeyboardAware();

    // A multiline field (e.g. a description) grows to fit its lines instead of
    // the fixed single-line size preset, so it reads as a taller text area.
    const isMultiline = rest.multiline === true;
    const lines =
      rest.numberOfLines && rest.numberOfLines > 0 ? rest.numberOfLines : 4;
    const multilineMinHeight =
      lines * theme.typography.body.lineHeight + theme.spacing.sm * 2;

    // Pixel size for each icon-size preset, resolved from the theme.
    const iconPixels: Record<TextFieldIconSize, number> = {
      xxs: theme.sizing.iconXxs,
      xs: theme.sizing.iconXs,
      sm: theme.sizing.iconSm,
      lg: theme.sizing.iconLg,
    };

    // Applies the chosen icon size to an icon node, leaving it untouched when no
    // size is requested or the node is not a sizable element.
    const withIconSize = (node: React.ReactNode): React.ReactNode =>
      iconSize && isValidElement<{ size?: number }>(node)
        ? cloneElement(node, { size: iconPixels[iconSize] })
        : node;

    // Tracks focus to drive the focused border style, and asks the surrounding
    // keyboard-aware scroll view (if any) to lift this field into view.
    const handleFocus = useCallback(
      (event: FocusEvent) => {
        setIsFocused(true);
        keyboardAware?.onInputFocus();
        onFocus?.(event);
      },
      [keyboardAware, onFocus],
    );

    // Tracks blur to reset the focused border style.
    const handleBlur = useCallback(
      (event: BlurEvent) => {
        setIsFocused(false);
        onBlur?.(event);
      },
      [onBlur],
    );

    return (
      <View style={styles.container}>
        {label ? (
          <FieldLabel label={label} required={required} style={styles.label} />
        ) : null}

        <View
          style={[
            styles.inputWrapper,
            isMultiline
              ? [styles.multiline, { minHeight: multilineMinHeight }]
              : styles[`size_${size}`],
            isFocused && styles.focused,
            !!error && styles.errored,
            !editable && styles.disabled,
          ]}
        >
          {leftIcon ? (
            <View style={styles.leftIcon}>{withIconSize(leftIcon)}</View>
          ) : null}
          <TextInput
            ref={ref}
            style={[styles.input, isMultiline && styles.multilineInput]}
            placeholderTextColor={theme.colors.textTertiary}
            editable={editable}
            onFocus={handleFocus}
            onBlur={handleBlur}
            accessibilityLabel={label}
            {...rest}
          />
          {rightIcon ? (
            <View style={styles.rightIcon}>{withIconSize(rightIcon)}</View>
          ) : null}
        </View>

        {error ? (
          <Text variant="caption" color="danger" style={styles.message}>
            {error}
          </Text>
        ) : helperText ? (
          <Text variant="caption" color="textTertiary" style={styles.message}>
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  },
);
