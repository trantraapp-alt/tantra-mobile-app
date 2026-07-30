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
      // Extra bottom room so the last card clears the floating action button.
      paddingBottom: theme.sizing.avatarLg + theme.spacing.xxl,
    },
    footerLoader: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
  });
}
