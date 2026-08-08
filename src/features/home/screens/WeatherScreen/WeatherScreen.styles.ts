// Style factory for the WeatherScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds weather screen styles from the active theme.
export function createWeatherScreenStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Scroll content padding + vertical rhythm.
    content: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl,
      gap: theme.spacing.lg,
    },
    // Centered container for the loading / error / empty states.
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    // Current-conditions hero block.
    hero: {
      alignItems: 'center',
      gap: theme.spacing.xxs,
      paddingVertical: theme.spacing.md,
    },
    heroEmoji: {
      fontSize: 52,
      lineHeight: 60,
    },
    heroTemp: {
      fontSize: 56,
      lineHeight: 62,
      fontFamily: theme.fontFamily.bold,
      fontWeight: theme.fontWeight.bold,
    },
    // A titled, softly-shadowed card.
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      ...theme.shadows.low,
    },
    // One advisory line: a toned dot beside a heading + body.
    tipRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    tipDot: {
      width: theme.spacing.sm,
      height: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      marginTop: theme.spacing.xs,
    },
    tipText: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // One forecast row: spray dot · day · icon · rain% · temps.
    dayRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    sprayDot: {
      width: theme.spacing.sm,
      height: theme.spacing.sm,
      borderRadius: theme.radius.pill,
    },
    dayName: {
      width: 48,
    },
    dayEmoji: {
      fontSize: 20,
      lineHeight: 24,
      width: 26,
      textAlign: 'center',
    },
    dayRain: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      width: 52,
    },
    dayTemp: {
      flex: 1,
      textAlign: 'right',
    },
    // "dot = spraying window" legend under the forecast title.
    legend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
  });
}
