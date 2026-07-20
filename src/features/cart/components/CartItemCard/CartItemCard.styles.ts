// Style factory for the CartItemCard component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds cart item styles from the active theme.
export function createCartItemStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Row container.
    container: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      ...theme.shadows.soft,
    },
    // Product thumbnail.
    image: {
      width: theme.sizing.avatarXl,
      height: theme.sizing.avatarXl,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Text and controls column.
    details: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    // Row wrapping the stepper and remove action.
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xs,
    },
    // Quantity stepper group.
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Quantity value.
    quantity: {
      minWidth: theme.spacing.xxl,
      textAlign: 'center',
    },
  });
}
