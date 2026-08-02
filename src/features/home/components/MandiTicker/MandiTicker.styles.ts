// Style factory for the MandiTicker live-price bar.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds MandiTicker styles from the active theme.
export function createMandiTickerStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Full-bleed dark ticker bar hosting the fixed label and scrolling rail.
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      // ~28px thin bar composed from spacing tokens (24 + 4).
      height: theme.spacing.xxl + theme.spacing.xs,
      backgroundColor: theme.colors.primaryDark,
      paddingLeft: theme.spacing.lg,
      overflow: 'hidden',
    },
    // Fixed leading "MANDI LIVE" gold pill (does not scroll).
    label: {
      backgroundColor: theme.colors.secondary,
      borderRadius: theme.radius.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      marginRight: theme.spacing.sm,
    },
    // Dark, on-brand text for the gold label pill.
    labelText: {
      color: theme.colors.primaryDark,
    },
    // Clipping viewport for the marquee track.
    marquee: {
      flex: 1,
      height: '100%',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    // Animated track holding the item sequence rendered twice.
    track: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    // A single copy of the full item sequence.
    copy: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    // One self-spacing price item (trailing padding keeps the loop seamless).
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingRight: theme.spacing.lg,
    },
    // Numeric text tuned for tabular alignment as prices scroll by.
    itemText: {
      fontVariant: ['tabular-nums'],
    },
    // Muted dot separating consecutive items.
    separator: {
      color: theme.colors.textTertiary,
    },
  });
}
