// Style factory for the Rating component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds rating styles from the active theme.
export function createRatingStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Row wrapping stars and the count label.
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    // Star row.
    stars: {
      flexDirection: 'row',
      gap: theme.spacing.xxs,
    },
    // Review count label spacing.
    count: {
      marginLeft: theme.spacing.xs,
    },
  });
}
