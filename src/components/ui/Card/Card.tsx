// Reusable elevated surface for card-based UI. Centralizes the card look —
// filled background, subtle border and a single soft shadow — so every card in
// the app shares it. Corner rounding is chosen via the themed `radius` prop.
import type { ReactNode } from 'react';
import { memo } from 'react';
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import type { CardRadiusKey } from '@/theme';

import { createCardStyles } from './Card.styles';

// Props for the Card surface.
export interface CardProps {
  // Card contents.
  children: ReactNode;
  // Named corner radius from the card scale: 'sm' (6), 'md' (8), 'lg' (12) or
  // 'xl' (14). Defaults to 'md'.
  radius?: CardRadiusKey;
  // Makes the card pressable; the card handles taps when provided.
  onPress?: () => void;
  // Whether to apply the default inner padding.
  padded?: boolean;
  // Extra style / layout override (e.g. flex sizing) applied last.
  style?: StyleProp<ViewStyle>;
  // Accessibility label used when the card is pressable.
  accessibilityLabel?: string;
}

// Renders a themed card surface with a soft shadow and chosen corner radius.
function CardComponent({
  children,
  radius = 'md',
  onPress,
  padded = true,
  style,
  accessibilityLabel,
}: CardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createCardStyles);

  // A static style array (never a function) keeps NativeWind's cssInterop from
  // dropping the background, border and shadow the way it does for function
  // `style` props on Pressable.
  const containerStyle: StyleProp<ViewStyle> = [
    styles.base,
    { borderRadius: theme.cardRadius[radius] },
    padded && styles.padded,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        android_ripple={{ color: theme.colors.surfaceVariant }}
        style={containerStyle}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

// Memoized card surface.
export const Card = memo(CardComponent);
