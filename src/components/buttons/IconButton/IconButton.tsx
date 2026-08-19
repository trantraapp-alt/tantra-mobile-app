// Circular pressable wrapping a single icon with themed feedback.
import type { LucideIcon } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import {
  Pressable,
  type PressableStateCallbackType,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createIconButtonStyles } from './IconButton.styles';

// Size presets for the icon button.
export type IconButtonSize = 'sm' | 'md' | 'lg';

// Props for the IconButton component.
export interface IconButtonProps {
  // Lucide icon component to render.
  icon: LucideIcon;
  // Press handler.
  onPress: () => void;
  // Size preset controlling touch target and icon size.
  size?: IconButtonSize;
  // Optional icon color override; defaults to primary text color.
  color?: string;
  // Optional fill for the icon's interior (e.g. a solid heart when saved).
  // Lucide icons are stroke-only by default; pass a color to fill them.
  fill?: string;
  // Whether to render a filled surface background.
  filled?: boolean;
  // Whether the control is disabled.
  disabled?: boolean;
  // Accessibility label describing the action.
  accessibilityLabel: string;
  // Optional container style override.
  style?: StyleProp<ViewStyle>;
}

// Maps a size preset to a concrete icon dimension from the theme.
function resolveIconSize(theme: ReturnType<typeof useTheme>, size: IconButtonSize) {
  if (size === 'sm') {
    return theme.sizing.iconSm;
  }
  if (size === 'lg') {
    return theme.sizing.iconLg;
  }
  return theme.sizing.iconMd;
}

// Renders a themed circular icon button.
function IconButtonComponent({
  icon: Icon,
  onPress,
  size = 'md',
  color,
  fill,
  filled = false,
  disabled = false,
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createIconButtonStyles);

  // A brief press-in scale-down (with opacity, below) so a tap reads as a
  // tactile, physical press rather than a flat color swap.
  const scale = useSharedValue(1);
  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handlePressIn = useCallback(() => {
    if (!disabled) {
      scale.value = withTiming(0.9, { duration: theme.animation.fast });
    }
  }, [disabled, scale, theme.animation.fast]);
  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: theme.animation.fast });
  }, [scale, theme.animation.fast]);

  // Renders the circular surface INSIDE the Pressable. The visual styling lives
  // on this inner View (a static style array) rather than the Pressable's
  // function `style`: NativeWind's cssInterop wraps a function `style` into an
  // array React Native never invokes, which would drop the filled background.
  const renderSurface = useCallback(
    ({ pressed }: PressableStateCallbackType) => (
      <View
        style={[
          styles.base,
          styles[`size_${size}`],
          filled && styles.filled,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <Icon
          size={resolveIconSize(theme, size)}
          color={color ?? theme.colors.textPrimary}
          fill={fill ?? 'none'}
        />
      </View>
    ),
    [styles, size, filled, disabled, Icon, theme, color, fill],
  );

  return (
    <Animated.View style={[style, animatedScale]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        hitSlop={theme.sizing.hitSlop}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {renderSurface}
      </Pressable>
    </Animated.View>
  );
}

// Memoized themed icon button.
export const IconButton = memo(IconButtonComponent);
