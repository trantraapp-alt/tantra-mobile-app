// Style factory for the AppSplash loading screen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds splash styles from a resolved theme (used outside ThemeProvider).
export function createSplashStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Centered full-screen container.
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xxxl,
      backgroundColor: theme.colors.background,
    },
    // Brand logo tile.
    logo: {
      width: theme.sizing.avatarXl,
      height: theme.sizing.avatarXl,
      borderRadius: theme.radius.xl,
    },
  });
}
