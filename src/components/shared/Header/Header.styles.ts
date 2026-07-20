// Style factory for the Header component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds header styles from the active theme.
export function createHeaderStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Header row container.
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: theme.sizing.headerHeight,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    // Leading side slot with fixed width for balance.
    side: {
      width: theme.sizing.minTouchTarget,
      alignItems: 'flex-start',
    },
    // Trailing side slot with fixed width for balance.
    sideEnd: {
      minWidth: theme.sizing.minTouchTarget,
      alignItems: 'flex-end',
    },
    // Centered title.
    title: {
      flex: 1,
      textAlign: 'center',
    },
  });
}
