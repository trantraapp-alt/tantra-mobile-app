// A subtle tone-tinted diagonal gradient wash — fades from a status color at
// the top-right corner down to transparent, so a business-profile card reads
// as designed rather than a flat surface without competing with the content
// stacked on top of it. Sized via its own onLayout since react-native-svg
// wants explicit pixel dimensions (the same convention as BrandGradient).
import { memo, useCallback, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

// Props for CardToneGradient.
export interface CardToneGradientProps {
  // The status/tone color to wash in (e.g. theme.colors.success).
  color: string;
  // Peak opacity of the wash at its brightest corner. Kept low by default so
  // it reads as a hint of color, not a colored panel.
  intensity?: number;
}

function CardToneGradientComponent({ color, intensity = 0.16 }: CardToneGradientProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={handleLayout}>
      {size.width > 0 && size.height > 0 ? (
        <Svg width={size.width} height={size.height}>
          <Defs>
            <LinearGradient id="cardTone" x1="1" y1="0" x2="0.15" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={intensity} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={size.width} height={size.height} fill="url(#cardTone)" />
        </Svg>
      ) : null}
    </View>
  );
}

// Memoized tone gradient backdrop.
export const CardToneGradient = memo(CardToneGradientComponent);
