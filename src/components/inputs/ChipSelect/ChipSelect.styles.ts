// Style factory for the ChipSelect component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds chip select styles from the active theme.
export function createChipSelectStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Outer container.
    container: {
      width: '100%',
    },
    // Label above the chips.
    label: {
      marginBottom: theme.spacing.xs,
    },
    // Wrapping row of option chips.
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    // Error message below the chips.
    error: {
      marginTop: theme.spacing.xs,
    },
  });
}
