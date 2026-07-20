// Primary pressable button supporting variants, sizes, loading and icons.
import { memo, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableStateCallbackType,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createButtonStyles } from './Button.styles';

// Visual style variants for the button.
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

// Size presets for the button.
export type ButtonSize = 'sm' | 'md' | 'lg';

// Props for the Button component.
export interface ButtonProps {
  // Text label rendered inside the button.
  label: string;
  // Press handler.
  onPress: () => void;
  // Visual variant.
  variant?: ButtonVariant;
  // Size preset.
  size?: ButtonSize;
  // Whether the button spans the full available width.
  fullWidth?: boolean;
  // Whether the button is disabled.
  disabled?: boolean;
  // Whether to show a loading spinner and block interaction.
  loading?: boolean;
  // Optional element rendered before the label.
  leftIcon?: React.ReactNode;
  // Optional element rendered after the label.
  rightIcon?: React.ReactNode;
  // Optional container style override.
  style?: StyleProp<ViewStyle>;
  // Accessibility label override.
  accessibilityLabel?: string;
}

// Renders a themed, accessible button with press feedback.
function ButtonComponent({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createButtonStyles);
  const isInteractive = !disabled && !loading;

  // Foreground color used for label and spinner based on the variant.
  const foregroundColor =
    variant === 'outline' || variant === 'ghost'
      ? theme.colors.primary
      : theme.colors.onPrimary;

  // Renders the visual surface INSIDE the Pressable. All container styling lives
  // on this inner View (a static style array) rather than on the Pressable's
  // function `style`: NativeWind's cssInterop wraps a function `style` into an
  // array that React Native never invokes, which would silently drop the
  // background, border, height and padding — leaving only the label visible.
  const renderSurface = useCallback(
    ({ pressed }: PressableStateCallbackType) => (
      <View
        style={[
          styles.base,
          styles[`size_${size}`],
          styles[`variant_${variant}`],
          pressed && isInteractive && styles.pressed,
          !isInteractive && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={foregroundColor} />
        ) : (
          <View style={styles.contentRow}>
            {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
            <Text
              variant="button"
              color={
                variant === 'outline' || variant === 'ghost'
                  ? 'primary'
                  : 'onPrimary'
              }
            >
              {label}
            </Text>
            {rightIcon ? (
              <View style={styles.iconRight}>{rightIcon}</View>
            ) : null}
          </View>
        )}
      </View>
    ),
    [
      styles,
      size,
      variant,
      isInteractive,
      loading,
      foregroundColor,
      leftIcon,
      rightIcon,
      label,
    ],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      disabled={!isInteractive}
      onPress={onPress}
      style={[fullWidth && styles.fullWidth, style]}
    >
      {renderSurface}
    </Pressable>
  );
}

// Memoized themed button.
export const Button = memo(ButtonComponent);
