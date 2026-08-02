// Auto-playing promotional banner carousel. Each page is a rounded banner —
// either a full-bleed image with a bottom gradient scrim for text legibility,
// or a solid brand-colored card — carrying a title, subtitle and CTA. Built on a
// plain paged ScrollView (a handful of cards, so virtualization buys nothing);
// auto-advance loops every few seconds and yields permanently once the user
// swipes, and the finger always wins.
import { useIsFocused } from '@react-navigation/native';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Text } from '@/components/ui';
import { fileUrl } from '@/config';
import { localize } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import type { PromoCard } from '../../types';
import { createPromoCarouselStyles } from './PromoCarousel.styles';

// Banner height as a fraction of its width (a wide, banner-like ratio).
const BANNER_RATIO = 0.5;
// Dwell time per banner before auto-advancing.
const AUTOPLAY_MS = 3500;
// Dark ink used for the CTA pill's label + chevron (the pill is always white,
// so this stays fixed rather than theme-driven).
const CTA_INK = '#1B1630';
// Fallback gradient colors when a card omits them.
const FALLBACK_FROM = '#6D28D9';
const FALLBACK_TO = '#9333EA';

// Bottom-to-top dark gradient that keeps overlaid text readable on any photo.
function BannerScrim({ width, height }: { width: number; height: number }) {
  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', left: 0, bottom: 0 }}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="promoScrim" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity={0} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0.6} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} fill="url(#promoScrim)" />
    </Svg>
  );
}

// Diagonal brand gradient filling an image-less banner. The gradient id is
// per-card so multiple banners never share one definition.
function PromoGradient({
  id,
  width,
  height,
  from,
  to,
}: {
  id: string;
  width: number;
  height: number;
  from: string;
  to: string;
}) {
  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} fill={`url(#${id})`} />
    </Svg>
  );
}

// Props for the PromoCarousel component.
export interface PromoCarouselProps {
  // Promo cards to render (rendered in `displayOrder`).
  cards: PromoCard[];
  // Called with the tapped card so the caller can run its CTA.
  onPress?: (card: PromoCard) => void;
}

// Renders the promotional banner carousel.
function PromoCarouselComponent({ cards, onPress }: PromoCarouselProps) {
  const styles = useThemedStyles(createPromoCarouselStyles);
  const theme = useTheme();
  const { language } = useTranslation();
  // Auto-advance only while the home screen is focused.
  const focused = useIsFocused();

  const ordered = useMemo(
    () =>
      [...cards].sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
      ),
    [cards],
  );
  const count = ordered.length;

  const [containerWidth, setContainerWidth] = useState(0);
  const [index, setIndex] = useState(0);
  // Once the user swipes, auto-advance never resumes for the session.
  const [interacted, setInteracted] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (containerWidth <= 0) {
        return;
      }
      const next = Math.round(
        event.nativeEvent.contentOffset.x / containerWidth,
      );
      indexRef.current = next;
      setIndex(next);
    },
    [containerWidth],
  );

  // Self-rescheduling auto-advance: every page change tears down the pending
  // timer and starts a fresh interval, so the banner never moves under a finger
  // that just acted. Retired for the session once the user takes over.
  useEffect(() => {
    if (!focused || interacted || containerWidth <= 0 || count <= 1) {
      return;
    }
    const timer = setTimeout(() => {
      const next = (indexRef.current + 1) % count;
      scrollRef.current?.scrollTo({ x: next * containerWidth, animated: true });
      indexRef.current = next;
      setIndex(next);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, interacted, containerWidth, count, focused]);

  if (count === 0) {
    return null;
  }

  const bannerWidth = Math.max(0, containerWidth - theme.spacing.lg * 2);
  const bannerHeight = bannerWidth * BANNER_RATIO;

  return (
    <View>
      <View style={styles.measure} onLayout={handleLayout}>
        {containerWidth > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={count > 1}
            onScrollBeginDrag={() => setInteracted(true)}
            onMomentumScrollEnd={handleMomentumEnd}
          >
            {ordered.map((card, cardIndex) => {
              const hasImage = Boolean(card.imageUrl && card.imageUrl.trim());
              const imageUri = hasImage
                ? fileUrl((card.imageUrl ?? '').trim())
                : undefined;
              const title = localize(card.title, language);
              const subtitle = card.subtitle
                ? localize(card.subtitle, language)
                : '';
              const ctaLabel = card.ctaLabel
                ? localize(card.ctaLabel, language)
                : '';
              const textColor =
                card.textColor && card.textColor.trim()
                  ? card.textColor.trim()
                  : '#FFFFFF';
              return (
                <View
                  key={card.cardId || `promo-${cardIndex}`}
                  style={[styles.slide, { width: containerWidth }]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={title}
                    onPress={onPress ? () => onPress(card) : undefined}
                    disabled={!onPress}
                  >
                    {({ pressed }) => (
                      <View
                        style={[
                          styles.banner,
                          { width: bannerWidth, height: bannerHeight },
                          hasImage
                            ? null
                            : { backgroundColor: card.bgColor ?? undefined },
                          pressed && onPress ? styles.pressed : null,
                        ]}
                      >
                        {imageUri ? (
                          <>
                            <Image
                              source={{ uri: imageUri }}
                              style={styles.image}
                              contentFit="cover"
                              accessibilityLabel={title}
                            />
                            <BannerScrim
                              width={bannerWidth}
                              height={bannerHeight}
                            />
                          </>
                        ) : (
                          <>
                            <PromoGradient
                              id={`promo-grad-${cardIndex}`}
                              width={bannerWidth}
                              height={bannerHeight}
                              from={card.bgColor ?? FALLBACK_FROM}
                              to={card.bgColorEnd ?? card.bgColor ?? FALLBACK_TO}
                            />
                            <View style={styles.decorCircle} pointerEvents="none" />
                            <View
                              style={styles.decorCircleSmall}
                              pointerEvents="none"
                            />
                          </>
                        )}

                        <View style={styles.content}>
                          <Text
                            variant="h3"
                            numberOfLines={2}
                            style={{ color: textColor }}
                          >
                            {title}
                          </Text>
                          {subtitle ? (
                            <Text
                              variant="caption"
                              numberOfLines={1}
                              style={{ color: textColor }}
                            >
                              {subtitle}
                            </Text>
                          ) : null}
                          {ctaLabel ? (
                            <View style={styles.ctaPill}>
                              <Text variant="label" style={styles.ctaText}>
                                {ctaLabel}
                              </Text>
                              <ChevronRight
                                size={theme.sizing.iconSm}
                                color={CTA_INK}
                              />
                            </View>
                          ) : null}
                        </View>
                      </View>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        ) : null}
      </View>

      {count > 1 ? (
        <View style={styles.dots}>
          {ordered.map((card, dotIndex) => (
            <View
              key={`dot-${card.cardId || dotIndex}`}
              style={[
                styles.dot,
                dotIndex === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

// Memoized promo banner carousel.
export const PromoCarousel = memo(PromoCarouselComponent);
