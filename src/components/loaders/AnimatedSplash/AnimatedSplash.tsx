// Professionally animated launch splash: staggered logo entrance, floating
// brand icons and a gradient wave, then a smooth fade-out to the app.
import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import type { LucideIcon } from 'lucide-react-native';
import {
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tag,
} from 'lucide-react-native';
import { useCallback, useEffect, useRef } from 'react';
import { useWindowDimensions, type ViewStyle } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createAnimatedSplashStyles } from './AnimatedSplash.styles';
import { FloatingIcon } from './FloatingIcon';
import { SplashWave } from './SplashWave';

// Static reference to the bundled brand logo asset.
const logoSource = require('../../../assets/images/logo.png');

// Configuration for a decorative floating background icon.
interface DecorConfig {
  // Icon component.
  icon: LucideIcon;
  // Horizontal position as a fraction of screen width.
  x: number;
  // Vertical position as a fraction of screen height.
  y: number;
  // Icon size.
  size: number;
  // Entrance/stagger delay in milliseconds.
  delay: number;
  // Float distance in points.
  distance: number;
}

// Placement of the faint background icons around the lower portion of screen.
const DECOR: DecorConfig[] = [
  { icon: ShoppingBag, x: 0.14, y: 0.62, size: 40, delay: 200, distance: 10 },
  { icon: ShieldCheck, x: 0.82, y: 0.6, size: 40, delay: 500, distance: 8 },
  { icon: Sparkles, x: 0.34, y: 0.68, size: 22, delay: 350, distance: 12 },
  { icon: ShoppingCart, x: 0.74, y: 0.72, size: 44, delay: 650, distance: 9 },
  { icon: Tag, x: 0.2, y: 0.78, size: 40, delay: 450, distance: 11 },
  { icon: Package, x: 0.5, y: 0.82, size: 34, delay: 300, distance: 10 },
  { icon: Search, x: 0.6, y: 0.66, size: 20, delay: 750, distance: 12 },
];

// Props for the AnimatedSplash component.
export interface AnimatedSplashProps {
  // Called once the exit animation completes so the host can unmount it.
  onFinish: () => void;
}

// Renders the animated launch splash overlay.
export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createAnimatedSplashStyles);
  const { width, height } = useWindowDimensions();
  const nativeHidden = useRef(false);

  const containerOpacity = useSharedValue<number>(theme.opacity.full);
  const logoOpacity = useSharedValue<number>(0);
  const logoScale = useSharedValue<number>(0.7);
  const logoFloat = useSharedValue<number>(0);
  const textOpacity = useSharedValue<number>(0);
  const textTranslate = useSharedValue<number>(theme.spacing.lg);
  const taglineOpacity = useSharedValue<number>(0);

  // Hides the native splash exactly once, when the animated splash is laid out.
  const handleLayout = useCallback(() => {
    if (!nativeHidden.current) {
      nativeHidden.current = true;
      void SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    // Logo fades and springs in, then breathes gently.
    logoOpacity.value = withTiming(theme.opacity.full, {
      duration: theme.animation.slow,
    });
    logoScale.value = withDelay(
      theme.animation.fast,
      withSpring(1, { damping: 11, stiffness: 120, mass: 0.9 }),
    );
    logoFloat.value = withDelay(
      theme.animation.slower,
      withRepeat(
        withSequence(
          withTiming(-theme.spacing.sm, { duration: theme.animation.slower }),
          withTiming(0, { duration: theme.animation.slower }),
        ),
        -1,
        true,
      ),
    );

    // Wordmark rises and fades in after the logo.
    textOpacity.value = withDelay(
      theme.animation.slow,
      withTiming(theme.opacity.full, { duration: theme.animation.slow }),
    );
    textTranslate.value = withDelay(
      theme.animation.slow,
      withTiming(0, { duration: theme.animation.slow }),
    );

    // Tagline fades in last.
    taglineOpacity.value = withDelay(
      theme.animation.slow + theme.animation.normal,
      withTiming(theme.opacity.full, { duration: theme.animation.slow }),
    );

    // Hold, then fade the whole overlay out and notify the host.
    containerOpacity.value = withDelay(
      2100,
      withTiming(0, { duration: theme.animation.slow }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      }),
    );
    // Animations are configured once on mount; shared values are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }, { translateY: logoFloat.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslate.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  // Builds an absolute position style for a decorative icon.
  const positionFor = (config: DecorConfig): ViewStyle => ({
    position: 'absolute',
    left: width * config.x,
    top: height * config.y,
  });

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      onLayout={handleLayout}
    >
      {DECOR.map((config, index) => (
        <FloatingIcon
          key={index}
          icon={config.icon}
          position={positionFor(config)}
          size={config.size}
          delay={config.delay}
          distance={config.distance}
        />
      ))}

      <Animated.View style={styles.content}>
        <Animated.View style={logoStyle}>
          <Image
            source={logoSource}
            style={styles.logo}
            contentFit="cover"
            accessibilityLabel="Tantra"
          />
        </Animated.View>

        <Animated.View style={[styles.wordmark, textStyle]}>
          <Text variant="display" color="primary">
            Tantr
          </Text>
          <Text variant="display" color="secondary">
            a
          </Text>
        </Animated.View>

        <Animated.View style={[styles.taglineRow, taglineStyle]}>
          <Animated.View style={styles.lineLeft} />
          <Text variant="label" color="textSecondary">
            The Smart Way to Buy &amp; Sell
          </Text>
          <Animated.View style={styles.lineRight} />
        </Animated.View>
      </Animated.View>

      <Animated.View style={styles.wave}>
        <SplashWave width={width} height={height * 0.22} />
      </Animated.View>
    </Animated.View>
  );
}
