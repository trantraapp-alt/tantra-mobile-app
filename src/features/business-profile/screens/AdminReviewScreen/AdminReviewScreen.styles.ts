import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/theme';

export function createAdminReviewStyles(theme: AppTheme) {
  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      marginBottom: theme.spacing.sm,
    },
    field: {
      marginBottom: theme.spacing.sm,
    },
    actionButtons: {
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },
    reasonSheet: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    reasonInput: {
      marginTop: theme.spacing.sm,
    },
  });
}
