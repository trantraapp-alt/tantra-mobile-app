// Style factory for GrantSubscriptionSheet.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createGrantSubscriptionSheetStyles(theme: AppTheme) {
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
    plansLoading: {
      paddingVertical: theme.spacing.sm,
      alignItems: 'flex-start',
    },
    plansError: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
  });
}
