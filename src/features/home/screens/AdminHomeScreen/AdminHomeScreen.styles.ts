// Style factory for AdminHomeScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds admin home dashboard styles from the active theme.
export function createAdminHomeStyles(theme: AppTheme) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl,
    },
    cards: {
      gap: theme.spacing.md,
    },
  });
}
