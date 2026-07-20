// Style factory for the SwitchRow component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds switch row styles from the active theme.
export function createSwitchRowStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Row with the label on the left and the switch on the right.
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      minHeight: theme.sizing.minTouchTarget,
    },
    // Label + helper text column.
    text: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
  });
}
