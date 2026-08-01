import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createAdminProfileListStyles(theme: AppTheme) {
  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    list: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxxl,
    },
    // Tone-tinted background + border (set inline per row) give each card a
    // soft wash of its own status color instead of a flat, uniform surface.
    card: {
      marginBottom: theme.spacing.sm,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    // Solid tone-colored circle behind the status icon.
    statusIcon: {
      width: theme.sizing.avatarSm,
      height: theme.sizing.avatarSm,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardBody: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    cardTitle: {
      flex: 1,
    },
    reasonPreview: {
      fontStyle: 'italic',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xxs,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    footerLoader: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
  });
}
