// Style factory for BlockUserSheet.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createBlockUserSheetStyles(theme: AppTheme) {
  return StyleSheet.create({
    content: {
      gap: theme.spacing.md,
    },
    sectionLabel: {
      marginBottom: -theme.spacing.xs,
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
  });
}
