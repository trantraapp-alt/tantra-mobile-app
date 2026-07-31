// Style factory for the ConfirmDialog component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds confirm-dialog styles from the active theme.
export function createConfirmDialogStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Dimmed backdrop centering the dialog.
    backdrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.overlay,
      paddingHorizontal: theme.spacing.xl,
    },
    // Centered dialog card.
    dialog: {
      width: '100%',
      maxWidth: 360,
      alignItems: 'center',
      gap: theme.spacing.sm,
      padding: theme.spacing.xl,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.card,
      ...theme.shadows.high,
    },
    // Tinted icon circle at the top.
    iconCircle: {
      width: theme.sizing.avatarLg,
      height: theme.sizing.avatarLg,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xs,
    },
    // Danger tone tint.
    iconCircleDanger: {
      backgroundColor: theme.colors.dangerLight,
    },
    // Primary tone tint.
    iconCirclePrimary: {
      backgroundColor: theme.colors.primaryLight,
    },
    // Cancel + confirm row.
    actions: {
      flexDirection: 'row',
      alignSelf: 'stretch',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    // Each action button fills half the row.
    actionButton: {
      flex: 1,
    },
  });
}
