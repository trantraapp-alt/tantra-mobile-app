// Style factory for the ResultsHeader.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds ResultsHeader styles from the active theme.
export function createResultsHeaderStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.borderStrong,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    count: {
      flexShrink: 1,
      textAlign: 'right',
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
