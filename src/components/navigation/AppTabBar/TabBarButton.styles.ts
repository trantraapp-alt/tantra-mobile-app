// Style factory for the TabBarButton component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds tab bar button styles from the active theme.
export function createTabBarButtonStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Tab button occupying an equal share of its group.
    button: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xxs,
      paddingVertical: theme.spacing.xs,
    },
    // Tab label under the icon.
    label: {
      letterSpacing: 0.2,
    },
  });
}
