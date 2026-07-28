import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createMyProfilesScreenStyles(theme: AppTheme) {
  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    list: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xxxl,
    },
    footerLoader: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
  });
}
