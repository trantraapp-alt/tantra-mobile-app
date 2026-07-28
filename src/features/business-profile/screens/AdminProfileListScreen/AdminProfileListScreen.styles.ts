import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createAdminProfileListStyles(theme: AppTheme) {
  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    list: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl,
    },
    card: {
      marginBottom: theme.spacing.md,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.xs,
    },
    meta: {
      marginTop: theme.spacing.xs,
    },
    footerLoader: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
  });
}
