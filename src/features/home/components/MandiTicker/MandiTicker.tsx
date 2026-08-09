// Thin, continuously scrolling "mandi" (market price) ticker for the home
// screen. It shows REAL daily prices from the Government of India (Agmarknet)
// scoped to the user's selected state/district (via useMandiPrices), and falls
// back to a curated list while loading or if the API is unavailable. A fixed
// gold "MANDI LIVE" label leads a left-scrolling marquee that renders the item
// sequence twice and animates one copy's width so it loops seamlessly. The
// marquee only runs while the home screen is focused.
import { useIsFocused } from '@react-navigation/native';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { localize, type LocalizedText } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';

import { useMandiPrices } from '../../hooks';
import type { MandiPrice } from '../../types';
import { createMandiTickerStyles } from './MandiTicker.styles';

// Props for the MandiTicker bar. It is fully self-contained and takes none.
export type MandiTickerProps = Record<string, never>;

// One rendered ticker line (from real data or the curated fallback). `change`
// is only present for the curated fallback — Agmarknet has no day-over-day %.
interface TickerLine {
  key: string;
  text: string;
  price: string;
  change?: { up: boolean; pct: string };
}

// A curated fallback commodity (bilingual, with a mock change indicator).
interface FallbackItem {
  emoji: string;
  name: LocalizedText;
  price: string;
  dir: 'up' | 'down';
  pct: string;
}

// Fixed label copy for the leading pill.
const LABEL: LocalizedText = { en: 'MANDI LIVE', hi: 'मंडी लाइव' };

// Curated fallback prices, used until real data loads or when it is unavailable.
const FALLBACK: FallbackItem[] = [
  { emoji: '🌾', name: { en: 'Wheat (Pune)', hi: 'गेहूं (पुणे)' }, price: '₹2,275/q', dir: 'up', pct: '1.2%' },
  { emoji: '🫘', name: { en: 'Tur Dal (Latur)', hi: 'तुअर दाल (लातूर)' }, price: '₹9,850/q', dir: 'down', pct: '0.6%' },
  { emoji: '🌿', name: { en: 'Cotton (Akola)', hi: 'कपास (अकोला)' }, price: '₹7,150/q', dir: 'up', pct: '2.1%' },
  { emoji: '🥜', name: { en: 'Groundnut (Rajkot)', hi: 'मूंगफली (राजकोट)' }, price: '₹6,400/q', dir: 'up', pct: '0.9%' },
  { emoji: '🍚', name: { en: 'Rice (Karnal)', hi: 'चावल (करनाल)' }, price: '₹3,890/q', dir: 'down', pct: '0.4%' },
  { emoji: '🫛', name: { en: 'Soybean (Indore)', hi: 'सोयाबीन (इंदौर)' }, price: '₹4,720/q', dir: 'up', pct: '1.8%' },
  { emoji: '🌽', name: { en: 'Corn (Nizamabad)', hi: 'मक्का (निज़ामाबाद)' }, price: '₹2,140/q', dir: 'up', pct: '0.5%' },
  { emoji: '🌾', name: { en: 'Jowar (Solapur)', hi: 'ज्वार (सोलापुर)' }, price: '₹3,275/q', dir: 'down', pct: '1.1%' },
];

// Roughly milliseconds spent traversing one pixel of the marquee.
const MS_PER_PIXEL = 22;
// Below this many real records, prefer the fuller curated fallback.
const MIN_REAL_LINES = 4;
// Cap the number of distinct commodities shown.
const MAX_LINES = 14;

// A relatable emoji for a commodity name (keyword-matched; wheat by default).
function commodityEmoji(name: string): string {
  const n = name.toLowerCase();
  if (/wheat|gehu/.test(n)) return '🌾';
  if (/rice|paddy|dhan|basmati/.test(n)) return '🍚';
  if (/cotton|kapas/.test(n)) return '🌿';
  if (/maize|corn|makka/.test(n)) return '🌽';
  if (/soy/.test(n)) return '🫛';
  if (/onion|pyaz/.test(n)) return '🧅';
  if (/tomato/.test(n)) return '🍅';
  if (/potato|aloo/.test(n)) return '🥔';
  if (/chilli|chili|mirch/.test(n)) return '🌶️';
  if (/groundnut|peanut/.test(n)) return '🥜';
  if (/gram|tur|arhar|dal|moong|urad|lentil|masur|pulse|pigeon|bean|pea|cowpea/.test(n)) {
    return '🫘';
  }
  if (/orange|mosambi|citrus|lemon/.test(n)) return '🍊';
  if (/banana/.test(n)) return '🍌';
  if (/mango/.test(n)) return '🥭';
  if (/apple/.test(n)) return '🍎';
  if (/grape/.test(n)) return '🍇';
  if (/brinjal|eggplant/.test(n)) return '🍆';
  if (/coconut/.test(n)) return '🥥';
  if (/sugar|jaggery|gur/.test(n)) return '🍬';
  if (/gourd|okra|ladies|carrot|spinach|cabbage|cauliflower|veg/.test(n)) return '🥬';
  return '🌾';
}

// Formats whole rupees with Indian digit grouping, e.g. 2275 -> "₹2,275".
function formatINR(value: number): string {
  const digits = Math.round(value).toString();
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest
    ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${lastThree}`
    : lastThree;
  return `₹${grouped}`;
}

// Builds ticker lines from real API prices, one per distinct commodity.
function buildFromApi(prices: MandiPrice[]): TickerLine[] {
  const seen = new Set<string>();
  const lines: TickerLine[] = [];
  for (const price of prices) {
    const commodity = price.commodity.trim();
    if (commodity === '' || seen.has(commodity.toLowerCase())) {
      continue;
    }
    seen.add(commodity.toLowerCase());
    const market = price.market.trim();
    lines.push({
      key: `${commodity}-${market}`,
      text: `${commodityEmoji(commodity)} ${commodity}${market ? ` (${market})` : ''}`,
      price: `${formatINR(price.modalPrice)}/q`,
    });
    if (lines.length >= MAX_LINES) {
      break;
    }
  }
  return lines;
}

// Renders the thin, self-looping mandi price ticker.
function MandiTickerComponent(_props: MandiTickerProps) {
  const styles = useThemedStyles(createMandiTickerStyles);
  const { language } = useTranslation();
  // Marquee runs only while the home screen is focused, so it stops consuming
  // the UI thread when the user is on another tab (tab screens stay mounted).
  const focused = useIsFocused();
  // Real prices scoped to the user's selected state / district.
  const { prices } = useMandiPrices();

  // Prefer real prices; fall back to the curated list while loading / on error.
  const lines = useMemo<TickerLine[]>(() => {
    if (prices.length >= MIN_REAL_LINES) {
      const real = buildFromApi(prices);
      if (real.length >= MIN_REAL_LINES) {
        return real;
      }
    }
    return FALLBACK.map((item, index) => ({
      key: `fallback-${index}`,
      text: `${item.emoji} ${localize(item.name, language)}`,
      price: item.price,
      change: { up: item.dir === 'up', pct: item.pct },
    }));
  }, [prices, language]);

  // Measured width of one full copy of the item sequence.
  const [copyWidth, setCopyWidth] = useState(0);
  const translateX = useSharedValue(0);

  // (Re)start the seamless left-scroll whenever the measured width changes or
  // focus is regained.
  useEffect(() => {
    if (copyWidth <= 0 || !focused) {
      return;
    }
    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-copyWidth, {
        duration: copyWidth * MS_PER_PIXEL,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    return () => {
      cancelAnimation(translateX);
    };
  }, [copyWidth, focused, translateX]);

  // Records the intrinsic width of the first copy for the loop distance.
  const handleCopyLayout = useCallback((event: LayoutChangeEvent) => {
    const measured = Math.round(event.nativeEvent.layout.width);
    setCopyWidth((prev) => (prev === measured ? prev : measured));
  }, []);

  // Drives the continuous horizontal scroll of the track.
  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Renders one full copy of the line sequence; `onLayout` measures the first.
  const renderCopy = (
    prefix: string,
    onLayout?: (event: LayoutChangeEvent) => void,
  ) => (
    <View style={styles.copy} onLayout={onLayout}>
      {lines.map((line) => (
        <View key={`${prefix}-${line.key}`} style={styles.item}>
          <Text
            variant="caption"
            color="onPrimary"
            numberOfLines={1}
            style={styles.itemText}
          >
            {line.text}
          </Text>
          <Text
            variant="caption"
            color="onPrimary"
            numberOfLines={1}
            style={styles.itemText}
          >
            {line.price}
          </Text>
          {line.change ? (
            <Text
              variant="caption"
              color={line.change.up ? 'success' : 'danger'}
              numberOfLines={1}
              style={styles.itemText}
            >
              {`${line.change.up ? '▲' : '▼'}${line.change.pct}`}
            </Text>
          ) : null}
          <Text variant="caption" numberOfLines={1} style={styles.separator}>
            •
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.bar} accessibilityRole="summary">
      <View style={styles.lead}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text variant="overline" color="onPrimary" style={styles.liveText}>
            LIVE
          </Text>
        </View>
        <Text
          variant="overline"
          color="onPrimary"
          numberOfLines={1}
          style={styles.mandiText}
        >
          {localize(LABEL, language)}
        </Text>
        <View style={styles.leadDivider} />
      </View>

      <View style={styles.marquee}>
        <Animated.View style={[styles.track, trackStyle]}>
          {renderCopy('a', handleCopyLayout)}
          {renderCopy('b')}
        </Animated.View>
      </View>
    </View>
  );
}

// Memoized live mandi price ticker.
export const MandiTicker = memo(MandiTickerComponent);
