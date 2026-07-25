// One pagination dot. It reads the pager's shared scroll offset directly, so
// the active dot widens and brightens continuously as the finger moves instead
// of snapping at the page boundary — and it costs zero JS re-renders per frame.
import { memo } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createImageCarouselStyles } from './ImageCarousel.styles';

// Props for a single pagination dot.
export interface CarouselDotProps {
  // Zero-based page this dot represents.
  index: number;
  // Live horizontal scroll offset of the pager, in points.
  scrollX: SharedValue<number>;
  // Live page width in points; 0 until the carousel has been measured.
  pageWidth: SharedValue<number>;
}

// Renders a dot that morphs between a small circle and a wide active pill.
function CarouselDotComponent({ index, scrollX, pageWidth }: CarouselDotProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createImageCarouselStyles);

  const dotSize = theme.spacing.sm;
  const activeWidth = theme.spacing.xxl;
  const idleOpacity = theme.opacity.disabled;
  const activeOpacity = theme.opacity.full;

  // Distance is measured in pages, so 0 = fully active and >= 1 = fully idle.
  const animatedStyle = useAnimatedStyle(() => {
    const width = pageWidth.value;
    const distance =
      width > 0 ? Math.abs(scrollX.value / width - index) : Math.abs(index);
    return {
      width: interpolate(
        distance,
        [0, 1],
        [activeWidth, dotSize],
        Extrapolation.CLAMP,
      ),
      opacity: interpolate(
        distance,
        [0, 1],
        [activeOpacity, idleOpacity],
        Extrapolation.CLAMP,
      ),
    };
  }, [index, dotSize, activeWidth, idleOpacity, activeOpacity]);

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

// Memoized pagination dot.
export const CarouselDot = memo(CarouselDotComponent);
