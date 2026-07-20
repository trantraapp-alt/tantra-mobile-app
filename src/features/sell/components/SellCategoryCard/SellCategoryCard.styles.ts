// Style factory for the SellCategoryCard component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds category card styles from the active theme.
export function createSellCategoryCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Card container.
    container: {
      flex: 1,
      alignItems: 'center',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
    },
    // Rounded icon backdrop.
    iconWrapper: {
      width: theme.sizing.avatarLg,
      height: theme.sizing.avatarLg,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Category icon image.
    icon: {
      width: theme.sizing.iconXxl,
      height: theme.sizing.iconXxl,
    },
  });
}
