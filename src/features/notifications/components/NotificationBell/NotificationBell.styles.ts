// Style factory for the NotificationBell component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds notification bell styles from the active theme.
export function createNotificationBellStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Unread count badge pinned to the bell's top-right.
    badge: {
      position: 'absolute',
      top: -theme.spacing.xxs,
      right: -theme.spacing.xxs,
      minWidth: theme.spacing.lg,
      height: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xxs,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.danger,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
