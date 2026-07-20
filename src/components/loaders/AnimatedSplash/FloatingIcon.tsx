// A faint background icon that gently floats to add depth to the splash.
import type { LucideIcon } from 'lucide-react-native';
import { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/providers';

// Props for the FloatingIcon component.
export interface FloatingIconProps {
  // Icon to render.
  icon: LucideIcon;
  // Absolute position style for the icon.
  position: ViewStyle;
  // Icon size.
  size: number;
  // Animation start delay in milliseconds for a staggered effect.
  delay: number;
  // Vertical float distance in points.
  distance: number;
}

// Renders a low-opacity, slowly floating decorative icon.
function FloatingIconComponent({
  icon: Icon,
  position,
  size,
  delay,
  distance,
}: FloatingIconProps) {
  const theme = useTheme();
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-distance, { duration: theme.animation.slower }),
          withTiming(0, { duration: theme.animation.slower }),
        ),
        -1,
        true,
      ),
    );
  }, [offset, delay, distance, theme.animation.slower]);

  // Drives the vertical floating motion.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[position, { opacity: theme.opacity.faint }, animatedStyle]}
    >
      <Icon size={size} color={theme.colors.primary} />
    </Animated.View>
  );
}

// Memoized floating decorative icon.
export const FloatingIcon = memo(FloatingIconComponent);
