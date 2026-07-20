// Full-bleed diagonal brand gradient (violet) rendered with react-native-svg,
// so no extra gradient dependency is needed. Sized explicitly by the caller and
// absolutely filled, it sits behind content as a decorative backdrop.
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/providers';

// Props for the BrandGradient component.
export interface BrandGradientProps {
  // Gradient width in points (usually the container/screen width).
  width: number;
  // Gradient height in points.
  height: number;
}

// Renders the violet brand gradient as an absolutely-filled backdrop.
function BrandGradientComponent({ width, height }: BrandGradientProps) {
  const theme = useTheme();

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={theme.colors.primary} />
          <Stop offset="1" stopColor={theme.colors.primaryDark} />
        </LinearGradient>
      </Defs>
      <Rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="url(#brandGradient)"
      />
    </Svg>
  );
}

// Memoized brand gradient backdrop.
export const BrandGradient = memo(BrandGradientComponent);
