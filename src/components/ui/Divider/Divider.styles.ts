// Style factory for the Divider component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds divider styles from the active theme.
export function createDividerStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Full-width hairline.
    horizontal: {
      height: StyleSheet.hairlineWidth,
      alignSelf: 'stretch',
      backgroundColor: theme.colors.divider,
    },
    // Full-height hairline.
    vertical: {
      width: StyleSheet.hairlineWidth,
      alignSelf: 'stretch',
      backgroundColor: theme.colors.divider,
    },
    // Vertical spacing around a horizontal divider.
    spaced: {
      marginVertical: theme.spacing.lg,
    },
  });
}
