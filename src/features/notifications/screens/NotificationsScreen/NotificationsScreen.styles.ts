// Style factory for the NotificationsScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds notifications screen styles from the active theme.
export function createNotificationsStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Centered container for loading / error states.
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    // Load-more spinner container.
    footerLoader: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
  });
}
