// Style factory for the Spinner component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds spinner styles from the active theme.
export function createSpinnerStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Full-screen centered container.
    fullScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    // Inline centered container.
    inline: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
  });
}
