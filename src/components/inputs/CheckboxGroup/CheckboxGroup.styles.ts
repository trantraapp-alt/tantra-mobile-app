// Style factory for the CheckboxGroup component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds checkbox group styles from the active theme.
export function createCheckboxGroupStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Outer container.
    container: {
      width: '100%',
    },
    // Label above the options.
    label: {
      marginBottom: theme.spacing.xs,
    },
    // Wrapping row of option chips.
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    // Error message below the options.
    error: {
      marginTop: theme.spacing.xs,
    },
  });
}
