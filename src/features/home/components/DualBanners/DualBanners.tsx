// Backend-driven "Today's Deals" banner row for the home screen: a wrapping grid
// of compact mini banners, one per deal card from GET /deals (two per row). Each
// banner is painted with a diagonal gradient derived from the API's accent color,
// carries a soft decorative blob + a "tap" chevron for affordance, and — when the
// API sends an emoji rather than a word — an oversized emoji watermark as artwork.
// Loads for the user's location and hides when there are none. Tapping routes by
// the card's ctaType — a deal group, a browse category or an in-app browser URL.
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ChevronRight } from 'lucide-react-native';
import { memo, useCallback, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { SectionHeader } from '@/components/shared';
import { Text } from '@/components/ui';
import { routes } from '@/constants';
import { type DealCardData, useDeals } from '@/features/deals';
import { useUserGeo } from '@/features/marketplace';
import { localize, type LocalizedText } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import { formatNumber } from '@/utils';

import { createDualBannersStyles } from './DualBanners.styles';

// The DualBanners row is self-sourced from the deals API — it takes no props.
export type DualBannersProps = Record<string, never>;

// Section heading (kept out of the global i18n catalog).
const TITLE: LocalizedText = { en: "Today's Deals", hi: 'आज के डील' };

// Fixed compact banner height; the gradient Svg needs an explicit height and every
// tile reads the same so a wrapped row stays even.
const BANNER_HEIGHT = 84;

// Neutral grey used whenever the API omits or malforms the accent color.
const FALLBACK_ACCENT = '#7C7C7C';

// Parses "#RGB" / "#RRGGBB" into [r, g, b]; falls back to a mid grey on bad or
// missing input so a malformed accent color never crashes the gradient.
function hexToRgb(hex: string | undefined | null): [number, number, number] {
  const clean = (typeof hex === 'string' ? hex : '').replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const value = Number.parseInt(full, 16);
  if (full.length !== 6 || Number.isNaN(value)) {
    return [124, 124, 124];
  }
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

// Mixes a hex color toward white (amount > 0) or black (amount < 0), amount in
// [-1, 1], and returns an "rgb(...)" string for use as a gradient stop.
function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const target = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  const mix = (c: number) => Math.round(c + (target - c) * p);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

// True when the icon is an actual glyph/emoji (has a non-ASCII character) rather
// than a plain word like "Crop" — only then is it worth rendering as artwork.
// Guards against a missing icon: Array.from(undefined) throws on Hermes.
function isGlyph(icon: string | undefined | null): boolean {
  return (
    typeof icon === 'string' &&
    Array.from(icon).some((ch) => (ch.codePointAt(0) ?? 0) > 127)
  );
}

// Props for a single deal banner tile.
interface DealBannerProps {
  card: DealCardData;
  // Stable index used only to build a unique gradient id within the row.
  index: number;
  isHi: boolean;
  onPress: (card: DealCardData) => void;
}

// A single compact deal banner: accent gradient + blob + chevron (+ emoji artwork
// when the API provides one).
function DealBannerComponent({ card, index, isHi, onPress }: DealBannerProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createDualBannersStyles);
  // The gradient Svg needs a measured width; height is fixed.
  const [width, setWidth] = useState(0);

  // Backend-driven fields are defended against missing values so a partial deal
  // card renders a plain-but-valid tile instead of crashing the whole row.
  const label = (isHi ? card.labelHi : card.labelEn) ?? '';
  const unit = (isHi ? card.unitHi : card.unitEn) ?? '';
  const badge = (isHi ? card.badgeHi : card.badgeEn) ?? '';
  const minPrice = card.minPrice;
  // "From ₹1500/day" — drop the unit when null (Animals), and skip the price
  // line entirely when there is no price, falling back to the badge subtitle.
  const price =
    minPrice != null
      ? isHi
        ? `₹${formatNumber(minPrice)}${unit} से शुरू`
        : `From ₹${formatNumber(minPrice)}${unit}`
      : '';
  const subtitle = price || badge;
  const count = card.listingCount ?? 0;

  // Admin background image wins only when explicitly enabled AND present.
  const bgUrl = card.backendUi === true ? card.backgroundImageUrl : null;

  const accent = card.accentColor ?? FALLBACK_ACCENT;
  const light = shade(accent, 0.2);
  const dark = shade(accent, -0.16);
  const gradientId = `dualBannerGrad-${index}`;
  const showWatermark = isGlyph(card.icon);

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    setWidth((prev) => (prev === next ? prev : next));
  };

  return (
    <Pressable
      style={styles.pressable}
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${price}`}
      onPress={() => onPress(card)}
    >
      {({ pressed }) => (
        <View
          style={[styles.banner, pressed ? styles.pressed : null]}
          onLayout={onLayout}
        >
          {bgUrl != null ? (
            // Admin-supplied background image: render it full-bleed with a dark
            // scrim so the overlaid label/count/price stay legible.
            <>
              <Image
                source={bgUrl}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.scrim} pointerEvents="none" />
            </>
          ) : (
            // Default design: accent gradient + decorative blob + emoji artwork.
            <>
              {width > 0 ? (
                <Svg
                  width={width}
                  height={BANNER_HEIGHT}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                >
                  <Defs>
                    <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0" stopColor={light} />
                      <Stop offset="0.55" stopColor={accent} />
                      <Stop offset="1" stopColor={dark} />
                    </LinearGradient>
                  </Defs>
                  <Rect
                    width={width}
                    height={BANNER_HEIGHT}
                    fill={`url(#${gradientId})`}
                  />
                </Svg>
              ) : null}

              {/* Soft decorative blob for depth behind the content. */}
              <View style={styles.blob} pointerEvents="none" />

              {/* Oversized emoji artwork, only when the icon is a real glyph. */}
              {showWatermark ? (
                <Text style={styles.watermark} allowFontScaling={false}>
                  {card.icon}
                </Text>
              ) : null}
            </>
          )}

          <View style={styles.bannerContent}>
            <View style={styles.textCol}>
              <Text variant="bodyMedium" color="onPrimary" numberOfLines={1}>
                {label}
              </Text>
              {subtitle ? (
                <Text
                  variant="caption"
                  color="onPrimary"
                  numberOfLines={1}
                  style={styles.priceText}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>

            {/* Listing count + a "tap" chevron, together as the affordance. */}
            <View style={styles.countPill}>
              {count > 0 ? (
                <Text
                  variant="overline"
                  color="onPrimary"
                  style={styles.countText}
                >
                  {formatNumber(count)}
                </Text>
              ) : null}
              <ChevronRight
                size={theme.sizing.iconXs}
                color={theme.colors.onPrimary}
              />
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const DealBanner = memo(DealBannerComponent);

// Renders the deals banner row.
function DualBannersComponent() {
  const styles = useThemedStyles(createDualBannersStyles);
  const { language } = useTranslation();
  const router = useRouter();
  const geo = useUserGeo();
  const { cards } = useDeals(geo);
  const isHi = language === 'HI';

  const onPress = useCallback(
    (card: DealCardData) => {
      const type = String(card.ctaType).toUpperCase();
      const name = language === 'HI' ? card.labelHi : card.labelEn;
      if (type === 'DEAL_GROUP') {
        router.push(routes.dealListings(card.ctaValue, name));
        return;
      }
      if (type === 'CATEGORY') {
        router.push(routes.browse(card.ctaValue, name));
        return;
      }
      if (type === 'URL') {
        void WebBrowser.openBrowserAsync(card.ctaValue);
      }
    },
    [router, language],
  );

  // Empty response → hide the whole section (no title over nothing).
  if (cards.length === 0) {
    return null;
  }

  return (
    <View>
      <View style={styles.header}>
        <SectionHeader title={localize(TITLE, language)} />
      </View>
      <View style={styles.row}>
        {cards.map((card, index) => (
          <DealBanner
            key={`${card.ctaType}-${card.ctaValue}`}
            card={card}
            index={index}
            isHi={isHi}
            onPress={onPress}
          />
        ))}
      </View>
    </View>
  );
}

// Memoized deals banner row.
export const DualBanners = memo(DualBannersComponent);
