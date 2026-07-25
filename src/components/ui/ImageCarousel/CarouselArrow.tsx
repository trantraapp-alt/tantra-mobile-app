// One edge arrow for the carousel.
//
// Deliberately local instead of reusing `IconButton`: it needs a scrim surface
// (a white glyph on a translucent pill so it stays legible over any photo in
// both color schemes) plus an animated end-of-gallery fade, and importing
// `@/components/buttons` from `@/components/ui` would close an import cycle —
// `Button` already imports `Text` from `@/components/ui`.
//
// The arrow is a sibling of the pager, not a child, so it does not scroll away
// with the photo — which also means a pan that STARTS on the circle is claimed
// by this Pressable and cannot be handed back to the ScrollView. That is a real
// ~36pt dead zone at each edge. It is kept as small as the touch target allows
// and no `hitSlop` is added, because invisible hit area here is pure dead zone.
import type { LucideIcon } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createImageCarouselStyles } from './ImageCarousel.styles';

// Props for a carousel edge arrow.
export interface CarouselArrowProps {
  // Lucide chevron to render.
  icon: LucideIcon;
  // Press handler that advances or rewinds the pager by one page.
  onPress: () => void;
  // Whether this end of the gallery has been reached; the arrow fades out and
  // stops accepting taps.
  disabled: boolean;
  // Accessibility label describing the direction.
  accessibilityLabel: string;
}

// Renders a translucent circular arrow that fades at the end of the gallery.
function CarouselArrowComponent({
  icon: Icon,
  onPress,
  disabled,
  accessibilityLabel,
}: CarouselArrowProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createImageCarouselStyles);

  // Cross-fades whenever `disabled` flips, so reaching an end reads as the
  // control retiring rather than the control vanishing.
  const animatedStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(
        disabled ? theme.opacity.subtle : theme.opacity.full,
        {
          duration: theme.animation.fast,
          easing: theme.easing.standard,
        },
      ),
    }),
    [disabled, theme],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
    >
      {/* Visual styling lives on this inner Animated.View, mirroring
          IconButton: NativeWind's cssInterop drops function/animated `style`
          props passed straight to Pressable. */}
      <Animated.View style={[styles.arrow, animatedStyle]}>
        <Icon size={theme.sizing.iconMd} color={theme.colors.onPrimary} />
      </Animated.View>
    </Pressable>
  );
}

// Memoized carousel edge arrow.
export const CarouselArrow = memo(CarouselArrowComponent);
