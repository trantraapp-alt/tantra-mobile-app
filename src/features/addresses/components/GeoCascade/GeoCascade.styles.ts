// Style factory for the GeoCascade component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds geo cascade styles from the active theme.
export function createGeoCascadeStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Stacked country / state / district selects.
    container: {
      gap: theme.spacing.md,
    },
  });
}
