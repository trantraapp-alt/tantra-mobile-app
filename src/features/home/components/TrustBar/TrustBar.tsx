// Full-width trust/stats strip shown on the home screen: a diagonal brand
// gradient band (violet → orange, from the logo) carrying live marketplace stat
// tiles whose numbers count up on mount. Tiles are admin-managed (GET
// /stats/public) — the bar loops over whatever the API returns, sorted by
// displayOrder, renders the pre-formatted value, picks the bilingual label for
// the active language, and hides entirely when there are none.
import { useFocusEffect } from 'expo-router';
import { Fragment, memo, useCallback, useRef, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import { usePublicStats } from '../../hooks';
import { CountUp } from './CountUp';
import { createTrustBarStyles } from './TrustBar.styles';

// The TrustBar takes no props — its content is self-sourced.
export type TrustBarProps = Record<string, never>;

// Puts a label's second word onto its own line ("Active Listings" ->
// "Active\nListings") so every tile's caption stacks to two lines.
function stackWords(label: string): string {
  return label.replace(' ', '\n');
}

// Renders the full-width marketplace stats strip.
function TrustBarComponent() {
  const theme = useTheme();
  const styles = useThemedStyles(createTrustBarStyles);
  const { language } = useTranslation();
  const stats = usePublicStats();
  // Measured band size — the gradient Svg needs explicit dimensions.
  const [size, setSize] = useState({ width: 0, height: 0 });
  // Replays the count-up each time the home screen regains focus — on app open
  // and when returning here from another page. The first focus is skipped since
  // the mount animation already covers it.
  const [runToken, setRunToken] = useState(0);
  const hasFocused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasFocused.current) {
        hasFocused.current = true;
        return;
      }
      setRunToken((token) => token + 1);
    }, []),
  );

  // Sort a copy by displayOrder so the source array order never matters.
  const items = [...stats].sort((a, b) => a.displayOrder - b.displayOrder);

  // Nothing to show → hide the ribbon entirely (no empty boxes).
  if (items.length === 0) {
    return null;
  }

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((prev) =>
      prev.width === width && prev.height === height
        ? prev
        : { width, height },
    );
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      {size.width > 0 ? (
        <Svg
          width={size.width}
          height={size.height}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            <LinearGradient id="trustBarGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={theme.colors.primary} />
              <Stop offset="0.6" stopColor={theme.colors.primaryDark} />
              <Stop offset="1" stopColor={theme.colors.secondary} />
            </LinearGradient>
          </Defs>
          <Rect
            width={size.width}
            height={size.height}
            fill="url(#trustBarGradient)"
          />
        </Svg>
      ) : null}

      {items.map((stat, index) => (
        <Fragment key={stat.statKey}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.item}>
            <CountUp
              value={stat.value}
              runToken={runToken}
              variant="h3"
              color="onPrimary"
              align="center"
              numberOfLines={1}
              style={styles.number}
            />
            <Text
              variant="overline"
              align="center"
              numberOfLines={2}
              style={styles.label}
            >
              {stackWords(language === 'HI' ? stat.labelHi : stat.labelEn)}
            </Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

// Memoized trust/stats strip.
export const TrustBar = memo(TrustBarComponent);
