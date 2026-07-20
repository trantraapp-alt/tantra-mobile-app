// Style factory for the ProfileScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds profile screen styles from the active theme.
export function createProfileStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Scroll content padding.
    content: {
      padding: theme.spacing.lg,
    },
    // User summary card.
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.lg,
    },
    // User name / email column.
    userInfo: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // Menu list wrapper.
    menu: {
      gap: theme.spacing.xxs,
    },
  });
}
