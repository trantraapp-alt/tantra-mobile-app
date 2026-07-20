// Style factory for the SectionHeader component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds section header styles from the active theme.
export function createSectionHeaderStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Row wrapping titles and the action.
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    // Title / subtitle stack.
    titles: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
  });
}
