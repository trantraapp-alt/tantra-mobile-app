// Style factory and shared metrics for the SellFab component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Computes the pixel metrics shared between the SVG ring and its styles.
export function sellFabMetrics(theme: AppTheme) {
  // Diameter of the solid pressable button.
  const fabSize = theme.sizing.avatarMd + theme.spacing.md;
  // Thickness of the gradient ring stroke.
  const ringStroke = theme.spacing.xs;
  // Gap between the button edge and the ring.
  const ringGap = theme.spacing.xxs;
  // Outer diameter of the ring (and its SVG canvas).
  const ringSize = fabSize + 2 * (ringGap + ringStroke);
  // Radius of the stroked circle within the SVG canvas.
  const ringRadius = (ringSize - ringStroke) / 2;
  return { fabSize, ringStroke, ringGap, ringSize, ringRadius };
}

// Builds Sell FAB styles from the active theme.
export function createSellFabStyles(theme: AppTheme) {
  const { fabSize, ringSize } = sellFabMetrics(theme);

  return StyleSheet.create({
    // Fixed-width wrapper holding the raised button and its label.
    wrapper: {
      width: ringSize,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    // Container lifting the ring + button above the tab bar.
    ringContainer: {
      width: ringSize,
      height: ringSize,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -theme.spacing.huge,
    },
    // Absolutely-positioned rotating gradient ring.
    ring: {
      position: 'absolute',
      width: ringSize,
      height: ringSize,
    },
    // Raised circular button centered within the ring.
    fab: {
      width: fabSize,
      height: fabSize,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      ...theme.shadows.high,
    },
    // "SELL" label under the button.
    label: {
      marginTop: theme.spacing.xs,
      letterSpacing: 0.5,
    },
  });
}
