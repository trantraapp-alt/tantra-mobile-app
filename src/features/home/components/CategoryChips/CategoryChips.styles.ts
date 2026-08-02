// Style factory for the CategoryChips rail.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds CategoryChips styles from the active theme.
export function createCategoryChipsStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Horizontal rail padding + inter-chip spacing.
    railContent: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    // A single rounded category pill.
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.pill,
      paddingLeft: theme.spacing.xs,
      paddingRight: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    // Chip with no leading icon: even padding on both sides.
    chipNoIcon: {
      paddingLeft: theme.spacing.md,
    },
    // Small leading category icon.
    icon: {
      width: theme.sizing.iconLg,
      height: theme.sizing.iconLg,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Pressed feedback.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
