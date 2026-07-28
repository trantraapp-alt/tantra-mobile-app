import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createAdminTrackerStyles(theme: AppTheme) {
  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: theme.spacing.lg,
    },
    tilesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    tile: {
      flex: 1,
      minWidth: '45%',
    },
    tileInner: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    },
    tileCount: {
      marginBottom: theme.spacing.xs,
    },
    reviewedByMe: {
      marginTop: theme.spacing.lg,
    },
    reviewedRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
    },
    reviewedItem: {
      alignItems: 'center',
      flex: 1,
    },
    dividerH: {
      height: 1,
      backgroundColor: 'transparent',
    },
  });
}
