// Style factory for the CategoryGrid card.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds CategoryGrid styles from the active theme.
export function createCategoryGridStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Outer card surface, inset from the screen edges.
    card: {
      marginHorizontal: theme.spacing.lg,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.cardRadius.lg,
    },
    // Title block with its small accent underline.
    header: {
      alignItems: 'flex-start',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    // Short secondary-colored accent bar beneath the heading.
    underline: {
      width: theme.spacing.xxl,
      height: 3,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.secondary,
    },
    // Wrapping 4-column grid; columns distributed edge-to-edge.
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: theme.spacing.md,
    },
    // One grid slot: four fit per row (4 x 22% + 3 gaps).
    cell: {
      width: '22%',
    },
    // Tinted rounded tile holding the emoji + label.
    tile: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.radius.md,
    },
    // Large emoji glyph acting as the tile icon.
    emoji: {
      fontSize: 28,
      lineHeight: 34,
    },
    // Pressed feedback on the tile.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
