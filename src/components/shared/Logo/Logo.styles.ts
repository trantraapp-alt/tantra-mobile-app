// Style factory for the Logo component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds logo tile styles from the active theme.
export function createLogoStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Rounded logo tile. No elevation/shadow: the logo PNG is transparent, and
    // Android would otherwise cast its elevation as a gray rectangular box.
    logo: {
      backgroundColor: theme.colors.transparent,
    },
  });
}
