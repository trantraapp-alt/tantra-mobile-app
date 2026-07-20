// Style factory for the AppTabBar component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds custom tab bar styles from the active theme.
export function createAppTabBarStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Bar container spanning the width, above the safe-area inset.
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      minHeight: theme.sizing.tabBarHeight,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    // Equal-width group holding regular tabs on each side of the Sell button.
    group: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      paddingBottom: theme.spacing.xs,
    },
  });
}
