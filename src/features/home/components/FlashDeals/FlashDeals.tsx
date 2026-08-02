// A dark, rounded "Flash Deals" promo card for the home screen: a title with a
// live countdown pill (HH : MM : SS) that ticks down every second and loops, and
// a horizontal rail of curated, discounted product cards. Purely presentational;
// the deals are hardcoded (the backend does not send this content) and a single
// `onPressDeal` callback fires for any card tap.
import { useIsFocused } from '@react-navigation/native';
import { memo, useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { localize, type LocalizedText } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';

import { createFlashDealsStyles } from './FlashDeals.styles';

// Props for the FlashDeals component.
export interface FlashDealsProps {
  // Called when any deal card is tapped.
  onPressDeal?: () => void;
}

// A single curated flash deal.
interface FlashDeal {
  // Stable list key.
  id: string;
  // Product emoji shown in the "image" area.
  emoji: string;
  // Bilingual product name.
  name: LocalizedText;
  // Discounted price (whole rupees).
  price: number;
  // Original price (whole rupees), rendered struck-through.
  oldPrice: number;
  // Discount percentage shown in the red badge.
  discount: number;
}

// Curated flash deals (not backend-driven).
const DEALS: FlashDeal[] = [
  {
    id: 'wheat-sharbati',
    emoji: '🌾',
    name: { en: 'Wheat Sharbati', hi: 'गेहूं शरबती' },
    price: 1936,
    oldPrice: 2200,
    discount: 12,
  },
  {
    id: 'bt-cotton-seeds',
    emoji: '🌱',
    name: { en: 'BT Cotton Seeds', hi: 'बीटी कपास बीज' },
    price: 765,
    oldPrice: 850,
    discount: 10,
  },
  {
    id: 'hybrid-tomato-seeds',
    emoji: '🍅',
    name: { en: 'Hybrid Tomato Seeds', hi: 'हाइब्रिड टमाटर बीज' },
    price: 432,
    oldPrice: 480,
    discount: 10,
  },
  {
    id: 'dap-fertilizer',
    emoji: '🧪',
    name: { en: 'DAP Fertilizer', hi: 'डीएपी उर्वरक' },
    price: 1215,
    oldPrice: 1350,
    discount: 10,
  },
];

// Section title.
const TITLE: LocalizedText = { en: '⚡ Flash Deals', hi: '⚡ फ्लैश डील' };
// "OFF" label appended after the discount percentage.
const OFF_LABEL: LocalizedText = { en: 'OFF', hi: 'छूट' };
// Tiny labels beneath each countdown block.
const HOURS_LABEL: LocalizedText = { en: 'Hrs', hi: 'घंटे' };
const MINUTES_LABEL: LocalizedText = { en: 'Min', hi: 'मिनट' };
const SECONDS_LABEL: LocalizedText = { en: 'Sec', hi: 'सेकंड' };

// Countdown seed (02:14:33) and the value it loops back to on hitting zero.
const START_SECONDS = 2 * 3600 + 14 * 60 + 33;
const RESET_SECONDS = 3 * 3600;

// Two-digit, zero-padded number.
function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

// Formats whole rupees with Indian digit grouping, e.g. 1936 -> "₹1,936".
function formatINR(value: number): string {
  const digits = Math.round(value).toString();
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest
    ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${lastThree}`
    : lastThree;
  return `₹${grouped}`;
}

// Renders the Flash Deals promo card.
function FlashDealsComponent({ onPressDeal }: FlashDealsProps) {
  const styles = useThemedStyles(createFlashDealsStyles);
  const { language } = useTranslation();
  // Tick only while the home screen is focused, so the once-a-second re-render
  // stops when the user is on another tab.
  const focused = useIsFocused();

  const [remaining, setRemaining] = useState(START_SECONDS);

  // Tick once a second; loop back to RESET_SECONDS when the clock runs out.
  useEffect(() => {
    if (!focused) {
      return;
    }
    const id = setInterval(() => {
      setRemaining((prev) => (prev <= 0 ? RESET_SECONDS : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [focused]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text variant="h4" color="secondary">
          {localize(TITLE, language)}
        </Text>

        <View style={styles.countdown} accessibilityRole="timer">
          <View style={styles.timeRow}>
            <Text variant="h4" color="secondary" style={styles.timeNum}>
              {pad2(hours)}
            </Text>
            <Text variant="h4" color="secondary" style={styles.timeColon}>
              :
            </Text>
            <Text variant="h4" color="secondary" style={styles.timeNum}>
              {pad2(minutes)}
            </Text>
            <Text variant="h4" color="secondary" style={styles.timeColon}>
              :
            </Text>
            <Text variant="h4" color="secondary" style={styles.timeNum}>
              {pad2(seconds)}
            </Text>
          </View>
          <View style={styles.labelRow}>
            <Text variant="overline" color="secondary" style={styles.timeLabel}>
              {localize(HOURS_LABEL, language)}
            </Text>
            <View style={styles.labelSpacer} />
            <Text variant="overline" color="secondary" style={styles.timeLabel}>
              {localize(MINUTES_LABEL, language)}
            </Text>
            <View style={styles.labelSpacer} />
            <Text variant="overline" color="secondary" style={styles.timeLabel}>
              {localize(SECONDS_LABEL, language)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {DEALS.map((deal) => {
          const name = localize(deal.name, language);
          const badge = `${deal.discount}% ${localize(OFF_LABEL, language)}`;
          return (
            <Pressable
              key={deal.id}
              accessibilityRole="button"
              accessibilityLabel={name}
              onPress={onPressDeal}
              disabled={!onPressDeal}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.dealCard,
                    pressed && onPressDeal ? styles.pressed : null,
                  ]}
                >
                  <View style={styles.imageArea}>
                    <Text style={styles.emoji}>{deal.emoji}</Text>
                    <View style={styles.badge}>
                      <Text
                        variant="overline"
                        color="onPrimary"
                        style={styles.badgeText}
                      >
                        {badge}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dealBody}>
                    <Text variant="label" color="onPrimary" numberOfLines={1}>
                      {name}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text
                        variant="bodyMedium"
                        color="secondary"
                        style={styles.price}
                      >
                        {formatINR(deal.price)}
                      </Text>
                      <Text variant="caption" style={styles.oldPrice}>
                        {formatINR(deal.oldPrice)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Memoized Flash Deals promo card.
export const FlashDeals = memo(FlashDealsComponent);
