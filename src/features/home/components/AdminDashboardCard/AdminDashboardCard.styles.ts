// Style factory for AdminDashboardCard.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds admin dashboard card styles from the active theme.
export function createAdminDashboardCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    iconCircle: {
      width: theme.sizing.avatarMd,
      height: theme.sizing.avatarMd,
      borderRadius: theme.sizing.avatarMd / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    description: {
      lineHeight: 16,
    },
    trailing: {
      alignItems: 'flex-end',
      gap: theme.spacing.xxs,
    },
    badge: {
      textAlign: 'right',
    },
  });
}
