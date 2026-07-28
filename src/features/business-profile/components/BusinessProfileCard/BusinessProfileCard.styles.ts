import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/theme';

export function createBusinessProfileCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    titleRow: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    reasonBox: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    blockedHint: {
      marginTop: theme.spacing.xs,
    },
    verifiedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xs,
    },
  });
}
