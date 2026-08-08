// A Text whose number animates up from zero once on mount (and on each runToken
// change), giving the trust-bar stats a lively "counting" feel. Any prefix /
// suffix (₹, +, %) and thousands separators are preserved. When bigSize +
// smallSize are given, digits render with alternating font sizes (1st, 3rd, 5th…
// large, the rest small); `plus` appends a trailing "+".
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { Text, type TextProps } from '@/components/ui';

// Props for the CountUp component.
export interface CountUpProps extends Omit<TextProps, 'children'> {
  // The final display value (e.g. "74", "12,400").
  value: string;
  // Count-up duration in ms.
  duration?: number;
  // Change this to replay the count-up from zero (e.g. on home-screen focus).
  runToken?: number;
  // When both are set, digits alternate between these two font sizes.
  bigSize?: number;
  smallSize?: number;
  // Append a "+" after the number (e.g. "70+").
  plus?: boolean;
}

// Splits a value into an optional prefix, an integer body (digits + commas) and
// an optional suffix so only the number animates. Returns null when there is no
// clean integer to count.
function decompose(
  value: string,
): { prefix: string; suffix: string; target: number } | null {
  const match = value.match(/^(\D*)([\d,]+)(\D*)$/);
  if (!match) {
    return null;
  }
  const target = Number((match[2] ?? '').replace(/,/g, ''));
  if (!Number.isFinite(target)) {
    return null;
  }
  return { prefix: match[1] ?? '', suffix: match[3] ?? '', target };
}

// Renders a Text whose number counts up to `value`.
export function CountUp({
  value,
  duration = 1200,
  runToken,
  bigSize,
  smallSize,
  plus,
  style,
  ...textProps
}: CountUpProps) {
  const parts = useMemo(() => decompose(value), [value]);
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(() =>
    parts ? `${parts.prefix}0${parts.suffix}` : value,
  );

  useEffect(() => {
    if (!parts) {
      setDisplay(value);
      return undefined;
    }
    const id = anim.addListener(({ value: current }) => {
      const n = Math.round(current).toLocaleString('en-IN');
      setDisplay(`${parts.prefix}${n}${parts.suffix}`);
    });
    anim.setValue(0);
    const animation = Animated.timing(anim, {
      toValue: parts.target,
      duration,
      easing: Easing.out(Easing.cubic),
      // Listener-driven text updates need the JS value, not a native transform.
      useNativeDriver: false,
    });
    animation.start();
    return () => {
      animation.stop();
      anim.removeListener(id);
    };
  }, [parts, value, duration, anim, runToken]);

  const text = plus && parts ? `${display}+` : display;

  // Plain render when there is no numeric value or no alternating sizes set.
  if (!parts || bigSize == null || smallSize == null) {
    return (
      <Text {...textProps} style={style}>
        {text}
      </Text>
    );
  }

  // Per-character render: the 1st, 3rd, 5th… digit large, the rest small.
  let digitIndex = 0;
  return (
    <View style={styles.row}>
      {text.split('').map((char, index) => {
        const isDigit = char >= '0' && char <= '9';
        const big = isDigit && digitIndex % 2 === 0;
        if (isDigit) {
          digitIndex += 1;
        }
        const fontSize = big ? bigSize : smallSize;
        return (
          <Text
            // Fixed-length list of characters; index is a stable enough key here.
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            {...textProps}
            style={[style, { fontSize, lineHeight: Math.round(fontSize * 1.15) }]}
          >
            {char}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Digits sit in a row, bottom-aligned so mixed sizes share a baseline.
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
});
