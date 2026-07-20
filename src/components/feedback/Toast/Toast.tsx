// Animated top toast/alert: slides down and fades in on mount, shows a
// countdown bar, then slides up and fades out before unmounting. Tapping it
// dismisses early.
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
} from 'lucide-react-native';
import { useCallback, useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';
import type { ColorScheme } from '@/theme';

import { createToastStyles } from './Toast.styles';

// Visual tone of a toast.
export type ToastVariant = 'error' | 'success' | 'info' | 'warning';

// A single toast to render.
export interface ToastData {
  // Unique id; changing it remounts the toast to replay the animation.
  id: number;
  // Message shown to the user.
  message: string;
  // Tone controlling the icon and accent color.
  variant: ToastVariant;
  // How long the toast stays before auto-dismissing (ms).
  duration: number;
}

// Props for the Toast component.
export interface ToastProps {
  // The toast to display.
  toast: ToastData;
  // Called once the exit animation completes so the host can unmount it.
  onDismiss: () => void;
}

// Per-variant icon and accent color-scheme key.
const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: LucideIcon; accent: keyof ColorScheme }
> = {
  error: { icon: AlertCircle, accent: 'danger' },
  success: { icon: CheckCircle2, accent: 'success' },
  info: { icon: Info, accent: 'info' },
  warning: { icon: AlertTriangle, accent: 'warning' },
};

// Renders an animated, auto-dismissing top toast.
export function Toast({ toast, onDismiss }: ToastProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createToastStyles);
  const insets = useSafeAreaInsets();

  const { icon: Icon, accent } = VARIANT_CONFIG[toast.variant];
  const accentColor = theme.colors[accent];

  // Distance to travel off-screen so the card is fully hidden while animating.
  const hiddenOffset = insets.top + theme.sizing.avatarXl;

  const translateY = useSharedValue<number>(-hiddenOffset);
  const opacity = useSharedValue<number>(0);
  const progress = useSharedValue<number>(1);
  const isDismissing = useRef(false);

  // Runs the exit animation once, then notifies the host to unmount.
  const dismiss = useCallback(() => {
    if (isDismissing.current) {
      return;
    }
    isDismissing.current = true;
    translateY.value = withTiming(-hiddenOffset, {
      duration: theme.animation.normal,
      easing: theme.easing.standard,
    });
    opacity.value = withTiming(
      0,
      { duration: theme.animation.normal },
      (finished) => {
        if (finished) {
          runOnJS(onDismiss)();
        }
      },
    );
  }, [hiddenOffset, onDismiss, theme, translateY, opacity]);

  useEffect(() => {
    // Enter: spring down into place while fading in.
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 160,
      mass: 0.8,
    });
    opacity.value = withTiming(theme.opacity.full, {
      duration: theme.animation.normal,
    });
    // Countdown bar shrinks over the visible duration.
    progress.value = withTiming(0, {
      duration: toast.duration,
      easing: theme.easing.linear,
    });

    const timer = setTimeout(dismiss, toast.duration);
    return () => clearTimeout(timer);
    // Animations are configured once per toast; shared values are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, { top: insets.top + theme.spacing.sm }, containerStyle]}
    >
      <View style={styles.shadowHost}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${toast.message}. Tap to dismiss.`}
          accessibilityLiveRegion="assertive"
          onPress={dismiss}
          style={styles.card}
        >
          <View style={[styles.iconBadge, { backgroundColor: accentColor }]}>
            <Icon size={theme.sizing.iconMd} color={theme.colors.onPrimary} />
          </View>

          <Text variant="bodyMedium" style={styles.message} numberOfLines={3}>
            {toast.message}
          </Text>

          <Animated.View
            style={[styles.progress, { backgroundColor: accentColor }, barStyle]}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
}
