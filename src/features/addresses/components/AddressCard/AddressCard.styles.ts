// Style factory for the AddressCard component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds address card styles from the active theme.
export function createAddressCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Default address: a purple border to highlight it (no background fill).
    cardDefault: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    // Header: location-icon tile + text block.
    header: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      alignItems: 'flex-start',
    },
    // Tinted location-icon tile.
    iconTile: {
      width: theme.sizing.avatarMd,
      height: theme.sizing.avatarMd,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryLight,
    },
    // Label + summary + mobile column.
    headerText: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xxs,
    },
    // Label + default badge row.
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    // Label takes the space the badge leaves.
    label: {
      flex: 1,
      minWidth: 0,
    },
    // Mobile number row with a phone icon.
    mobileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xxs,
    },
    // Hairline divider between the details and the actions.
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md,
    },
    // Actions row: edit / set-default on the left, delete on the right.
    actions: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    // Left action group; wraps under width pressure so delete stays reachable.
    actionsLeft: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
  });
}
