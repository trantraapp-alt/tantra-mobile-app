// Full-width trust/stats strip shown on the home screen: a primary-colored band
// carrying four marketplace stats (farmers, districts, value traded,
// satisfaction) separated by thin vertical dividers. Uses the live public stats
// (GET /stats/public) when available, and falls back to curated values while
// loading or if the endpoint is unavailable.
import { Fragment, memo } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { localize, type LocalizedText } from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';

import { usePublicStats } from '../../hooks';
import { createTrustBarStyles } from './TrustBar.styles';

// A single stat: a display value over a bilingual label.
interface TrustStat {
  id: string;
  value: string;
  label: LocalizedText;
}

// Bilingual labels shared by the live + fallback stats.
const LABELS = {
  farmers: { en: 'Farmers', hi: 'किसान' },
  districts: { en: 'Districts', hi: 'ज़िले' },
  traded: { en: 'Traded', hi: 'व्यापार' },
  satisfied: { en: 'Satisfied', hi: 'संतुष्ट' },
} as const;

// Curated fallback stats used until the live values load.
const FALLBACK: readonly TrustStat[] = [
  { id: 'farmers', value: '12,400+', label: LABELS.farmers },
  { id: 'districts', value: '48', label: LABELS.districts },
  { id: 'traded', value: '₹4.2Cr+', label: LABELS.traded },
  { id: 'satisfied', value: '98%', label: LABELS.satisfied },
];

// Formats a whole number with Indian digit grouping (e.g. 12400 -> "12,400").
function formatIndian(value: number): string {
  const digits = Math.round(value).toString();
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3);
  return rest
    ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${lastThree}`
    : lastThree;
}

// Formats a traded value into ₹Cr / ₹L / plain rupees.
function formatTraded(value: number): string {
  if (value >= 1e7) {
    return `₹${(value / 1e7).toFixed(1)}Cr+`;
  }
  if (value >= 1e5) {
    return `₹${(value / 1e5).toFixed(1)}L+`;
  }
  return `₹${formatIndian(value)}`;
}

// The TrustBar takes no props — its content is self-sourced.
export type TrustBarProps = Record<string, never>;

// Renders the full-width marketplace stats strip.
function TrustBarComponent() {
  const styles = useThemedStyles(createTrustBarStyles);
  const { language } = useTranslation();
  const stats = usePublicStats();

  const items: readonly TrustStat[] = stats
    ? [
        {
          id: 'farmers',
          value: formatIndian(stats.sellerCount),
          label: LABELS.farmers,
        },
        {
          id: 'districts',
          value: formatIndian(stats.districtCount),
          label: LABELS.districts,
        },
        {
          id: 'traded',
          value: formatTraded(stats.totalTradeValue),
          label: LABELS.traded,
        },
        {
          id: 'satisfied',
          value: `${Math.round(stats.satisfiedPct)}%`,
          label: LABELS.satisfied,
        },
      ]
    : FALLBACK;

  return (
    <View style={styles.container}>
      {items.map((stat, index) => (
        <Fragment key={stat.id}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.item}>
            <Text
              variant="h3"
              color="onPrimary"
              align="center"
              numberOfLines={1}
              style={styles.number}
            >
              {stat.value}
            </Text>
            <Text
              variant="overline"
              align="center"
              numberOfLines={1}
              style={styles.label}
            >
              {localize(stat.label, language)}
            </Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

// Memoized trust/stats strip.
export const TrustBar = memo(TrustBarComponent);
