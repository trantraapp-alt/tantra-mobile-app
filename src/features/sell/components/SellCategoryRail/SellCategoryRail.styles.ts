// Style factory for the SellCategoryRail component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds category rail styles from the active theme.
export function createSellCategoryRailStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Scroll content padding.
    content: {
      paddingVertical: theme.spacing.sm,
    },
    // Single selectable category entry.
    item: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs,
      borderLeftWidth: theme.spacing.xxs,
      borderLeftColor: theme.colors.transparent,
    },
    // Highlighted state for the active category.
    itemSelected: {
      borderLeftColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    // Icon container.
    iconWrap: {
      width: theme.sizing.avatarMd,
      height: theme.sizing.avatarMd,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.cardRadius.lg,
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Icon container while selected.
    iconWrapSelected: {
      backgroundColor: theme.colors.card,
    },
    // Category icon image.
    icon: {
      width: '64%',
      height: '64%',
    },
    // Category name; full width so the full name wraps onto two lines.
    label: {
      width: '100%',
    },
  });
}
