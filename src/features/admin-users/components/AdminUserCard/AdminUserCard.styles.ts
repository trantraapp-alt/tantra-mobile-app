// Style factory for AdminUserCard — mirrors the business-profile admin card's
// layout (photo/icon tile, identity column, corner status badge) so admin
// list screens read as one design system.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createAdminUserCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      marginBottom: theme.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      position: 'relative',
    },
    // Status badge, pinned to the top-right corner of the card.
    cornerBadge: {
      position: 'absolute',
      top: 2,
      right: 2,
      zIndex: 1,
    },
    iconWrap: {
      width: theme.sizing.avatarLg,
      height: theme.sizing.avatarLg,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xxs,
    },
    name: {
      marginRight: theme.spacing.xl,
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xxs,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
  });
}
