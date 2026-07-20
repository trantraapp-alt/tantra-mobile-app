// Style factory for the LanguageToggle component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds language toggle styles from the active theme.
export function createLanguageToggleStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Rounded pill container, matching the trailing icon buttons.
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      height: theme.sizing.minTouchTarget,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceVariant,
    },
  });
}
