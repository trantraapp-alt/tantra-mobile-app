// Style factory for the SearchBar component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds search bar styles from the active theme.
export function createSearchBarStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Rounded container holding the icon and input.
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      height: theme.sizing.inputHeight,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    // Search text input.
    input: {
      flex: 1,
      color: theme.colors.textPrimary,
      ...theme.typography.body,
      paddingVertical: theme.spacing.none,
    },
  });
}
