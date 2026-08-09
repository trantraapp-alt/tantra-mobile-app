// Style factory for the MandiTicker live-price bar.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Fixed decorative whites layered on the dark ticker bar.
const DOT = '#FFFFFF';
const LEAD_DIVIDER = 'rgba(255,255,255,0.3)';

// Builds MandiTicker styles from the active theme.
export function createMandiTickerStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Full-bleed dark ticker bar hosting the fixed lead and scrolling rail.
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      // A touch taller to seat the LIVE badge comfortably (28 + a little).
      height: theme.spacing.xxl + theme.spacing.sm,
      backgroundColor: theme.colors.primaryDark,
      paddingLeft: theme.spacing.lg,
      overflow: 'hidden',
    },
    // Fixed leading block: LIVE badge + "MANDI LIVE" + divider (does not scroll).
    lead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingRight: theme.spacing.sm,
    },
    // Orange "● LIVE" badge.
    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      backgroundColor: theme.colors.secondary,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
    },
    // Small white live dot.
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: theme.radius.pill,
      backgroundColor: DOT,
    },
    liveText: {
      letterSpacing: 0.5,
    },
    // "MANDI LIVE" wordmark.
    mandiText: {
      letterSpacing: 0.4,
    },
    // Thin divider before the scrolling prices.
    leadDivider: {
      width: StyleSheet.hairlineWidth,
      height: 14,
      backgroundColor: LEAD_DIVIDER,
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
