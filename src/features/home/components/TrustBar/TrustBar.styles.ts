// Style factory for the TrustBar stats strip.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Thin divider between stats — a low-opacity white hairline that reads on the
// primary-colored band in both light and dark schemes.
const DIVIDER = 'rgba(255, 255, 255, 0.2)';
// Muted white for the tiny uppercase captions sitting on the primary band.
const LABEL_WHITE = 'rgba(255, 255, 255, 0.7)';

// Builds TrustBar styles from the active theme.
export function createTrustBarStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Full-width band: a flat row on the primary color, no shadow.
    container: {
      flexDirection: 'row',
      alignItems: 'stretch',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      ...theme.shadows.none,
    },
    // Each stat takes an equal share and centers its value + label.
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xxs,
    },
    // Thin vertical rule between adjacent stats.
    divider: {
      width: StyleSheet.hairlineWidth,
      alignSelf: 'stretch',
      marginVertical: theme.spacing.xs,
      backgroundColor: DIVIDER,
    },
    // Bold headline number (h3 is semibold by default; bump to bold).
    number: {
      fontFamily: theme.fontFamily.bold,
      fontWeight: theme.fontWeight.bold,
    },
    // Tiny uppercase caption under each number.
    label: {
      color: LABEL_WHITE,
      textTransform: 'uppercase',
    },
  });
}
