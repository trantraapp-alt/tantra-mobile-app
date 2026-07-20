// Animated shimmer placeholder used while content is loading.
import { memo, useEffect } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createSkeletonStyles } from './Skeleton.styles';

// Props for the Skeleton placeholder.
export interface SkeletonProps {
  // Width of the placeholder.
  width?: DimensionValue;
  // Height of the placeholder.
  height?: DimensionValue;
  // Corner radius of the placeholder.
  radius?: number;
  // Optional style override.
  style?: StyleProp<ViewStyle>;
}

// Renders a single pulsing skeleton block.
function SkeletonComponent({ width = '100%', height = 16, radius, style }: SkeletonProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSkeletonStyles);
  const progress = useSharedValue<number>(theme.opacity.muted);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(theme.opacity.full, { duration: theme.animation.slow }),
      -1,
      true,
    );
  }, [progress, theme.animation.slow, theme.opacity.full]);

  // Drives the pulsing opacity of the placeholder.
  const animatedStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Animated.View
      style={[
        styles.block,
        { width, height, borderRadius: radius ?? theme.radius.sm },
        animatedStyle,
        style,
      ]}
    />
  );
}

// Memoized shimmer skeleton block.
export const Skeleton = memo(SkeletonComponent);
