// Style factory for the FilterSheet.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds FilterSheet styles from the active theme.
export function createFilterSheetStyles(theme: AppTheme) {
  return StyleSheet.create({
    content: {
      gap: theme.spacing.lg,
    },
    rowLabel: {
      marginBottom: theme.spacing.sm,
    },
    rowHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    chip: {
      borderRadius: theme.radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    actionButton: {
      flex: 1,
    },
    attrLoading: {
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
  });
}
