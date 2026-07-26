// Raised central Sell action button with a continuously rotating gradient ring.
import { Plus } from 'lucide-react-native';
import { memo, useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import { createSellFabStyles, sellFabMetrics } from './SellFab.styles';

// Props for the SellFab component.
export interface SellFabProps {
  // Called when the Sell button is pressed.
  onPress: () => void;
}

// Renders the raised Sell action button with a rotating gradient border.
function SellFabComponent({ onPress }: SellFabProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSellFabStyles);
  const { t } = useTranslation();
  const rotation = useSharedValue(0);

  const { ringSize, ringRadius, ringStroke } = sellFabMetrics(theme);

  useEffect(() => {
    // Continuously rotate the gradient ring.
    rotation.value = withRepeat(
      withTiming(360, {
        duration: theme.animation.spin,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [rotation, theme.animation.spin]);

  // Drives the ring rotation.
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.ringContainer}>
        <Animated.View style={[styles.ring, ringStyle]}>
          <Svg width={ringSize} height={ringSize}>
            <Defs>
              <LinearGradient id="sellRing" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={theme.colors.primary} />
                <Stop offset="0.5" stopColor={theme.colors.secondary} />
                <Stop offset="1" stopColor={theme.colors.primary} />
              </LinearGradient>
            </Defs>
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              stroke="url(#sellRing)"
              strokeWidth={ringStroke}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </Animated.View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('tab.service')}
          onPress={onPress}
          style={styles.fab}
        >
          <Plus size={theme.sizing.iconXl} color={theme.colors.onPrimary} />
        </Pressable>
      </View>

      <Text variant="overline" color="primary" style={styles.label}>
        {t('tab.service')}
      </Text>
    </View>
  );
}

// Memoized Sell FAB.
export const SellFab = memo(SellFabComponent);
