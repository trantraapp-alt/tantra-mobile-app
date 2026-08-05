// A Text whose number animates up from zero once on mount, giving the trust-bar
// stats a lively "counting" feel. Any prefix / suffix (₹, +, %) and thousands
// separators are preserved; a value with no clean integer (decimals, plain text)
// renders as-is without animating.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

import { Text, type TextProps } from '@/components/ui';

// Props for the CountUp component.
export interface CountUpProps extends Omit<TextProps, 'children'> {
  // The final display value (e.g. "74", "12,400").
  value: string;
  // Count-up duration in ms.
  duration?: number;
  // Change this to replay the count-up from zero (e.g. when the home screen
  // regains focus). Each new value re-runs the animation.
  runToken?: number;
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

// Renders a Text whose number counts up to `value` once on mount.
export function CountUp({
  value,
  duration = 1200,
  runToken,
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

  return <Text {...textProps}>{display}</Text>;
}
