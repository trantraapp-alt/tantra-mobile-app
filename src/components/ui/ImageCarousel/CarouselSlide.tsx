// One gallery page: the photo, a visible loading indicator while it decodes,
// and a broken-image fallback so a single dead URL cannot leave an unexplained
// blank rectangle in the middle of the gallery — on a seller's own preview,
// "still loading" and "this upload failed" must never look identical.
import { Image } from 'expo-image';
import { ImageOff } from 'lucide-react-native';
import { memo, useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createImageCarouselStyles } from './ImageCarousel.styles';

// Props for a single carousel page.
export interface CarouselSlideProps {
  // Zero-based page index, passed back to `onPress`.
  index: number;
  // Absolute image URI to render.
  uri: string;
  // Measured page width in points; always equals the pager's frame width.
  width: number;
  // Measured page height in points; taken from the frame rather than a
  // percentage, which a horizontal scroller's content box may not resolve.
  height: number;
  // How the photo fills the page.
  contentFit: 'cover' | 'contain';
  // Accessibility label announcing the photo's position in the gallery.
  accessibilityLabel: string;
  // Whether taps on this page are forwarded to `onPress`.
  pressable: boolean;
  // Called with this page's index when the photo is tapped.
  onPress: (index: number) => void;
}

// Renders one full-width page of the gallery.
function CarouselSlideComponent({
  index,
  uri,
  width,
  height,
  contentFit,
  accessibilityLabel,
  pressable,
  onPress,
}: CarouselSlideProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createImageCarouselStyles);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Marks this page as broken so it shows the fallback instead of nothing.
  const handleError = useCallback(() => {
    setFailed(true);
    setLoaded(true);
  }, []);

  // Clears the loading indicator once the bitmap is on screen.
  const handleLoad = useCallback(() => setLoaded(true), []);

  // Forwards the tap with this page's index.
  const handlePress = useCallback(() => onPress(index), [onPress, index]);

  const body = (
    <>
      {failed ? null : (
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit={contentFit}
          transition={theme.animation.fast}
          cachePolicy="memory-disk"
          onLoad={handleLoad}
          onError={handleError}
          accessibilityIgnoresInvertColors
        />
      )}
      {failed || !loaded ? (
        <View style={styles.slideOverlay} pointerEvents="none">
          {failed ? (
            <ImageOff
              size={theme.sizing.iconLg}
              color={theme.colors.textTertiary}
            />
          ) : (
            <ActivityIndicator color={theme.colors.textTertiary} />
          )}
        </View>
      ) : null}
    </>
  );

  if (!pressable) {
    return (
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        style={[styles.slide, { width, height }]}
      >
        {body}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="imagebutton"
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      style={[styles.slide, { width, height }]}
    >
      {body}
    </Pressable>
  );
}

// Memoized carousel page.
export const CarouselSlide = memo(CarouselSlideComponent);
