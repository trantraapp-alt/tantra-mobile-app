// Full-bleed image gallery: one photo per page, swipeable left/right through
// every image in upload order, with edge arrows, a "3 / 7" counter, an animated
// dot indicator and optional auto-advance that yields permanently to the user.
//
// Built on a plain horizontal ScrollView with `pagingEnabled` rather than a
// FlatList/FlashList: a listing holds a handful of photos so virtualization buys
// nothing, native paging gives the exact platform snap feel for free, and
// `scrollTo` can never throw or no-op the way `FlatList.scrollToIndex` does when
// layout has not settled. The scroll offset is mirrored into a Reanimated shared
// value so the dots animate on the UI thread with no per-frame re-render.
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react-native';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  type LayoutChangeEvent,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import type { CardRadiusKey } from '@/theme';

import { CarouselArrow } from './CarouselArrow';
import { CarouselDot } from './CarouselDot';
import { CarouselSlide } from './CarouselSlide';
import { createImageCarouselStyles } from './ImageCarousel.styles';

// Above this many photos the dot row is dropped and the counter pill carries the
// position alone — a dozen dots read as noise rather than as navigation.
const MAX_DOTS = 8;
// Floor for the auto-advance interval; anything faster is unreadable.
const MIN_AUTOPLAY_INTERVAL = 1500;
// Default dwell time on each photo when auto-advance is enabled.
const DEFAULT_AUTOPLAY_INTERVAL = 4000;
// Total automatic advances allowed per mount. Auto-advance exists to say "this
// is a swipeable gallery", not to animate indefinitely: capping the run keeps
// the motion window short enough that no visible pause control is owed
// (WCAG 2.2.2), which an interval-only limit would not achieve.
const MAX_AUTOPLAY_ADVANCES = 3;
// Sub-pixel layout jitter below this many points is ignored when re-measuring.
const SIZE_EPSILON = 1;
// How long after a programmatic scroll the real offset is re-read. Android can
// clamp or silently drop a `scrollTo` issued against stale content bounds; this
// is the only thing that can heal the resulting index/photo mismatch, because a
// dropped scroll produces no scroll event at all.
const RECONCILE_DELAY = 450;

// How auto-advance behaves once it reaches the final photo.
export type CarouselAutoPlayBehavior = 'once' | 'loop';

// Measured viewport box of the gallery frame.
interface CarouselSize {
  // Frame width in points; also the page stride.
  width: number;
  // Frame height in points.
  height: number;
}

// Props for the ImageCarousel component.
export interface ImageCarouselProps {
  // Absolute image URIs in upload order — the first uploaded photo renders
  // first. Resolve stored relative `/files/..` paths with `fileUrl()` before
  // passing them in, and memoize the array so slides are not re-keyed.
  images: string[];
  // Width-to-height ratio of the gallery frame; 1 (square) by default.
  aspectRatio?: number;
  // How each photo fills its page: 'cover' crops, 'contain' letterboxes.
  contentFit?: 'cover' | 'contain';
  // Page shown on first render; clamped into range.
  initialIndex?: number;
  // Corner rounding from the card radius scale; omit for square corners.
  radius?: CardRadiusKey;
  // Whether to auto-advance through the gallery. Off by default.
  autoPlay?: boolean;
  // Dwell time per photo in milliseconds when auto-advancing.
  autoPlayInterval?: number;
  // 'once' stops on the last photo (default); 'loop' rewinds to the first.
  autoPlayBehavior?: CarouselAutoPlayBehavior;
  // Externally suspends auto-advance, e.g. while the screen is not focused.
  paused?: boolean;
  // Whether to render the left/right arrow controls.
  showArrows?: boolean;
  // Whether to render the "3 / 7" counter pill.
  showCounter?: boolean;
  // Whether to render the animated dot indicator.
  showDots?: boolean;
  // Called whenever the visible page changes.
  onIndexChange?: (index: number) => void;
  // Called with the tapped page index, e.g. to open a full-screen viewer.
  onPressImage?: (index: number) => void;
  // Message shown in place of the gallery when there are no images.
  emptyLabel?: string;
  // Extra layout style for the gallery frame.
  style?: StyleProp<ViewStyle>;
  // Test id applied to the gallery frame.
  testID?: string;
}

// Renders a swipeable, arrow-navigable image gallery.
function ImageCarouselComponent({
  images,
  aspectRatio = 1,
  contentFit = 'cover',
  initialIndex = 0,
  radius,
  autoPlay = false,
  autoPlayInterval = DEFAULT_AUTOPLAY_INTERVAL,
  autoPlayBehavior = 'once',
  paused = false,
  showArrows = true,
  showCounter = true,
  showDots = true,
  onIndexChange,
  onPressImage,
  emptyLabel,
  style,
  testID,
}: ImageCarouselProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createImageCarouselStyles);
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();

  // Drop blank entries so a partially failed upload cannot render an empty page.
  const uris = useMemo(
    () => images.filter((uri) => typeof uri === 'string' && uri.trim() !== ''),
    [images],
  );
  const count = uris.length;
  const lastIndex = Math.max(0, count - 1);
  const startIndex = Math.min(Math.max(initialIndex, 0), lastIndex);

  const scrollRef = useRef<Animated.ScrollView>(null);
  // Mirrors `index` for callbacks that must not read stale state: rapid arrow
  // taps and the post-rotation re-anchor both run outside the render cycle.
  const indexRef = useRef(startIndex);
  // Mirrors the measured frame for the same reason.
  const sizeRef = useRef<CarouselSize>({ width: 0, height: 0 });
  // Pending reconcile timer for the most recent programmatic scroll.
  const reconcileRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Automatic advances performed so far, capped by MAX_AUTOPLAY_ADVANCES.
  const advancesRef = useRef(0);
  // Latest caller callbacks, latched so an inline arrow function from the parent
  // cannot change `commitIndex`'s identity — that would rebuild the autoplay
  // timeout and the native scroll handler on every parent render, and a parent
  // that re-renders faster than the interval would silently never auto-advance.
  const onIndexChangeRef = useRef(onIndexChange);
  const onPressImageRef = useRef(onPressImage);

  const [index, setIndex] = useState(startIndex);
  const [size, setSize] = useState<CarouselSize>({ width: 0, height: 0 });
  // Once true the user has taken control and auto-advance never resumes.
  const [userTookOver, setUserTookOver] = useState(false);
  const [appActive, setAppActive] = useState(true);

  // UI-thread mirrors driving the dots without a re-render per frame.
  const scrollX = useSharedValue(0);
  const pageWidth = useSharedValue(0);
  const activeIndex = useSharedValue(startIndex);
  // Page a programmatic scroll is heading for, or -1 when the finger is in
  // charge. Frames crossing intermediate pages are ignored while it is set, so
  // an arrow tap or an autoplay tick cannot blip the counter backwards.
  const targetIndex = useSharedValue(-1);

  useEffect(() => {
    onIndexChangeRef.current = onIndexChange;
    onPressImageRef.current = onPressImage;
  }, [onIndexChange, onPressImage]);

  // The single writer for the current page: keeps the ref, the UI-thread mirror
  // and React state in lockstep and fires `onIndexChange` exactly once.
  const commitIndex = useCallback(
    (next: number) => {
      if (indexRef.current === next) {
        return;
      }
      indexRef.current = next;
      activeIndex.value = next;
      setIndex(next);
      onIndexChangeRef.current?.(next);
    },
    [activeIndex],
  );

  // Re-reads the real scroll offset after a programmatic scroll and re-derives
  // the page from it, so a clamped or dropped native `scrollTo` cannot leave the
  // counter, dots and arrows describing a photo that is not on screen.
  const scheduleReconcile = useCallback(() => {
    if (reconcileRef.current) {
      clearTimeout(reconcileRef.current);
    }
    reconcileRef.current = setTimeout(() => {
      reconcileRef.current = null;
      const pageSize = sizeRef.current.width;
      if (pageSize <= 0) {
        return;
      }
      const actual = Math.min(
        Math.max(Math.round(scrollX.value / pageSize), 0),
        Math.max(0, count - 1),
      );
      targetIndex.value = -1;
      commitIndex(actual);
    }, RECONCILE_DELAY);
  }, [commitIndex, count, scrollX, targetIndex]);

  // Scrolls to a page and commits it optimistically, so back-to-back arrow taps
  // advance by one each instead of both resolving against the same old index.
  const goTo = useCallback(
    (next: number, animated = true) => {
      const pageSize = sizeRef.current.width;
      if (pageSize <= 0 || count === 0) {
        return;
      }
      const target = Math.min(Math.max(next, 0), count - 1);
      targetIndex.value = target;
      scrollRef.current?.scrollTo({
        x: target * pageSize,
        y: 0,
        animated: animated && !reducedMotion,
      });
      commitIndex(target);
      scheduleReconcile();
    },
    [commitIndex, count, reducedMotion, scheduleReconcile, targetIndex],
  );

  // Retires auto-advance permanently and hands the pager back to the finger.
  const takeOver = useCallback(() => {
    setUserTookOver(true);
    targetIndex.value = -1;
  }, [targetIndex]);

  const handlePrevious = useCallback(() => {
    takeOver();
    goTo(indexRef.current - 1);
  }, [goTo, takeOver]);

  const handleNext = useCallback(() => {
    takeOver();
    goTo(indexRef.current + 1);
  }, [goTo, takeOver]);

  // Forwards a slide tap through the latched callback so every CarouselSlide
  // stays memo-stable even when the caller passes an inline handler.
  const handlePressImage = useCallback((pressedIndex: number) => {
    onPressImageRef.current?.(pressedIndex);
  }, []);

  // Measures the frame. The raw, fractional width is kept on purpose: pages must
  // be exactly as wide as the pager's frame or `pagingEnabled` snap points and
  // page edges drift apart a fraction of a point per page. The height is
  // measured too, because a page sized with `height: '100%'` resolves against a
  // horizontal scroller's content-derived cross axis and can collapse to zero.
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      const previous = sizeRef.current;
      if (
        width <= 0 ||
        (Math.abs(width - previous.width) < SIZE_EPSILON &&
          Math.abs(height - previous.height) < SIZE_EPSILON)
      ) {
        return;
      }
      sizeRef.current = { width, height };
      pageWidth.value = width;
      setSize({ width, height });
    },
    [pageWidth],
  );

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        scrollX.value = event.contentOffset.x;
        const pageSize = pageWidth.value;
        if (pageSize <= 0) {
          return;
        }
        // Commit as soon as the halfway point is crossed so the counter and the
        // arrow states track the finger, and hop to JS only on a real change.
        const next = Math.min(
          Math.max(Math.round(event.contentOffset.x / pageSize), 0),
          lastIndex,
        );
        if (targetIndex.value >= 0) {
          // A programmatic scroll is in flight: ignore every page it merely
          // passes through, and release the lock once it lands.
          if (next !== targetIndex.value) {
            return;
          }
          targetIndex.value = -1;
        }
        if (next !== activeIndex.value) {
          activeIndex.value = next;
          runOnJS(commitIndex)(next);
        }
      },
      onBeginDrag: () => {
        // The finger always wins: auto-advance never resumes after a swipe, and
        // any in-flight programmatic target is abandoned.
        targetIndex.value = -1;
        runOnJS(takeOver)();
      },
      onMomentumEnd: (event) => {
        const pageSize = pageWidth.value;
        if (pageSize <= 0) {
          return;
        }
        // Android can settle a point or two off a page boundary; re-derive the
        // index from the resting offset so state can never end up stale.
        const settled = Math.min(
          Math.max(Math.round(event.contentOffset.x / pageSize), 0),
          lastIndex,
        );
        targetIndex.value = -1;
        activeIndex.value = settled;
        runOnJS(commitIndex)(settled);
      },
    },
    [commitIndex, lastIndex, takeOver],
  );

  // Re-anchors after the first measure, after any width change (rotation, tablet
  // split view) and after the photo list changes: the native offset is still
  // `oldWidth * index`, which would park the pager between two pages.
  useEffect(() => {
    const width = size.width;
    if (width <= 0 || count === 0) {
      return;
    }
    const target = Math.min(Math.max(indexRef.current, 0), count - 1);
    indexRef.current = target;
    activeIndex.value = target;
    setIndex(target);
    // One frame of slack so the pages have been laid out at the new width — on
    // Android a `scrollTo` issued in the same frame is silently dropped.
    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: target * width, y: 0, animated: false });
      scrollX.value = target * width;
      targetIndex.value = -1;
    });
    return () => cancelAnimationFrame(frame);
  }, [size.width, count, activeIndex, scrollX, targetIndex]);

  // Timers keep firing while the app is backgrounded; without this the gallery
  // would silently jump several photos while the user was away.
  useEffect(() => {
    if (!autoPlay) {
      return;
    }
    setAppActive(AppState.currentState === 'active');
    const subscription = AppState.addEventListener('change', (state) => {
      setAppActive(state === 'active');
    });
    return () => subscription.remove();
  }, [autoPlay]);

  // Auto-advance as a self-rescheduling timeout keyed on `index`, not a
  // `setInterval`: every page change — swipe, arrow or timer — tears the pending
  // timeout down and starts a fresh full interval. That removes the stale-closure
  // bug, removes drift, and guarantees the gallery never moves under a finger
  // that just acted. `userTookOver` then retires it for the rest of the session.
  useEffect(() => {
    const canAutoPlay =
      autoPlay &&
      !paused &&
      !userTookOver &&
      !reducedMotion &&
      appActive &&
      count > 1 &&
      size.width > 0 &&
      advancesRef.current < MAX_AUTOPLAY_ADVANCES;
    if (!canAutoPlay) {
      return;
    }
    if (autoPlayBehavior === 'once' && index >= count - 1) {
      return;
    }
    const delay = Math.max(autoPlayInterval, MIN_AUTOPLAY_INTERVAL);
    const timer = setTimeout(() => {
      advancesRef.current += 1;
      const next = index + 1;
      // Rewinding across every page would be a long, ugly sweep, so the loop
      // variant snaps back to the first photo instead of animating there.
      if (next > count - 1) {
        goTo(0, false);
        return;
      }
      goTo(next);
    }, delay);
    return () => clearTimeout(timer);
  }, [
    appActive,
    autoPlay,
    autoPlayBehavior,
    autoPlayInterval,
    count,
    goTo,
    index,
    paused,
    reducedMotion,
    size.width,
    userTookOver,
  ]);

  // A pending reconcile must never outlive the component.
  useEffect(
    () => () => {
      if (reconcileRef.current) {
        clearTimeout(reconcileRef.current);
        reconcileRef.current = null;
      }
    },
    [],
  );

  const frameStyle: StyleProp<ViewStyle> = [
    styles.container,
    { aspectRatio },
    radius ? { borderRadius: theme.cardRadius[radius] } : null,
    style,
  ];

  if (count === 0) {
    return (
      <View
        testID={testID}
        accessible
        accessibilityRole="image"
        accessibilityLabel={emptyLabel ?? t('carousel.empty')}
        style={frameStyle}
      >
        <View style={styles.empty}>
          <ImageOff
            size={theme.sizing.iconXl}
            color={theme.colors.textTertiary}
          />
          <Text variant="caption" color="textTertiary" align="center">
            {emptyLabel ?? t('carousel.empty')}
          </Text>
        </View>
      </View>
    );
  }

  // A single photo is a photo, not a gallery: no arrows, dots, counter, paging
  // or auto-advance.
  const isGallery = count > 1;
  const dotsVisible = isGallery && showDots && count <= MAX_DOTS;

  return (
    <View testID={testID} onLayout={handleLayout} style={frameStyle}>
      {size.width > 0 ? (
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          scrollEnabled={isGallery}
          showsHorizontalScrollIndicator={false}
          overScrollMode="never"
          scrollEventThrottle={16}
          contentOffset={{ x: startIndex * size.width, y: 0 }}
          onScroll={scrollHandler}
          style={styles.scroll}
        >
          {/* Every page is mounted. A listing carries a handful of photos
              (bounded by the IMAGE field's `max`), so a decode window would
              only buy the chance of showing a blank page to a fast swiper. */}
          {uris.map((uri, slideIndex) => (
            <CarouselSlide
              key={`${slideIndex}-${uri}`}
              index={slideIndex}
              uri={uri}
              width={size.width}
              height={size.height}
              contentFit={contentFit}
              accessibilityLabel={t('carousel.position', {
                current: slideIndex + 1,
                total: count,
              })}
              pressable={Boolean(onPressImage)}
              onPress={handlePressImage}
            />
          ))}
        </Animated.ScrollView>
      ) : null}

      {isGallery && showArrows ? (
        <View style={styles.arrowLayer} pointerEvents="box-none">
          <CarouselArrow
            icon={ChevronLeft}
            onPress={handlePrevious}
            disabled={index === 0}
            accessibilityLabel={t('carousel.previous')}
          />
          <CarouselArrow
            icon={ChevronRight}
            onPress={handleNext}
            disabled={index === lastIndex}
            accessibilityLabel={t('carousel.next')}
          />
        </View>
      ) : null}

      {isGallery && showCounter ? (
        <View
          style={styles.counter}
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          <Text variant="overline" style={styles.counterText}>
            {t('carousel.counter', { current: index + 1, total: count })}
          </Text>
        </View>
      ) : null}

      {dotsVisible ? (
        <View
          style={styles.dotsLayer}
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          <View style={styles.dotsPill}>
            {uris.map((uri, dotIndex) => (
              <CarouselDot
                key={`dot-${dotIndex}-${uri}`}
                index={dotIndex}
                scrollX={scrollX}
                pageWidth={pageWidth}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

// Memoized image gallery.
export const ImageCarousel = memo(ImageCarouselComponent);
