// Style factory for UsersFilterSheet.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createUsersFilterSheetStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Breathing room between filter sections.
    content: {
      gap: theme.spacing.lg,
    },
    sectionLabel: {
      marginBottom: theme.spacing.sm,
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    // Sticky footer action row (Reset / Apply).
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    actionButton: {
      flex: 1,
    },
  });
}
