// Style factory for the SellCategoryRail component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds category rail styles from the active theme.
export function createSellCategoryRailStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Horizontal scroll content. flexGrow + space-evenly centers the entries
    // and gives each equal room when they fit; it scrolls when they don't.
    content: {
      flexGrow: 1,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'flex-start',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    // Single selectable category entry (fixed width so labels sit on one or two
    // tidy lines without looking cramped).
    item: {
      width: theme.sizing.avatarXl,
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.md,
    },
    // Highlighted state for the active category (soft tint, no accent border).
    itemSelected: {
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
    // Emoji glyph shown when there is no image (matches the Home "Browse
    // Categories" tiles).
    emoji: {
      fontSize: 28,
      lineHeight: 34,
    },
    // Category name; full width so the full name wraps onto two lines.
    label: {
      width: '100%',
    },
  });
}
