// A rounded horizontal progress track whose fill renders as a diagonal
// two-color gradient — used across the stats dashboard (success rate,
// category breakdown) so every proportional bar in the feature reads as one
// visual system. The gradient itself spans the *track's* full width and stays
// fixed regardless of the percentage; only an opaque "mask" view sized to the
// unfilled remainder slides over it, which keeps the gradient's hue consistent
// at any fill level instead of restarting/compressing it (the same fixed-scale
// trick BrandGradient/TrustBar use, adapted to a variable-width fill).
import { memo, useCallback, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useThemedStyles } from '@/hooks';

import { createGradientProgressBarStyles } from './GradientProgressBar.styles';

// Props for GradientProgressBar.
export interface GradientProgressBarProps {
  // Fill amount, 0–100. Values outside that range are clamped.
  percentage: number;
  // Gradient stop colors, left → right.
  colors: readonly [string, string];
  // Track (unfilled) background color.
  trackColor: string;
  // Bar height in points.
  height?: number;
}

function GradientProgressBarComponent({
  percentage,
  colors,
  trackColor,
  height = 8,
}: GradientProgressBarProps) {
  const styles = useThemedStyles(createGradientProgressBarStyles);
  const [width, setWidth] = useState(0);
  const clamped = Math.max(0, Math.min(100, percentage));

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: trackColor },
      ]}
      onLayout={handleLayout}
    >
      {width > 0 ? (
        <>
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="progressFill" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors[0]} />
                <Stop offset="1" stopColor={colors[1]} />
              </LinearGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width={width}
              height={height}
              fill="url(#progressFill)"
            />
          </Svg>
          <View
            style={[
              styles.mask,
              {
                width: width * (1 - clamped / 100),
                backgroundColor: trackColor,
              },
            ]}
          />
        </>
      ) : null}
    </View>
  );
}

// Memoized gradient-filled progress bar.
export const GradientProgressBar = memo(GradientProgressBarComponent);
