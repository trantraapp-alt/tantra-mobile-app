import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createBPFormScreenStyles(theme: AppTheme) {
  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    typePicker: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    typePickerLabel: {
      marginBottom: theme.spacing.sm,
    },
    typeOption: {
      marginBottom: theme.spacing.sm,
    },
  });
}
