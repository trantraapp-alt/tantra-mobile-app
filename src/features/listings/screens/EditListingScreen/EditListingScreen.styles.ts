// Style factory for the EditListingScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds edit listing screen styles from the active theme.
export function createEditListingScreenStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Centered container for loading/error states.
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
  });
}
