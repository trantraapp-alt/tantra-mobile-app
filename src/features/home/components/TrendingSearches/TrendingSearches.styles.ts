// Style factory for the TrendingSearches section.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds TrendingSearches styles from the active theme.
export function createTrendingSearchesStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Section wrapper: stacks the label row above the chip rail.
    section: {
      gap: theme.spacing.sm,
    },
    // Label row owns its horizontal padding so the section runs edge-to-edge.
    header: {
      paddingHorizontal: theme.spacing.lg,
    },
    // Uppercase heading treatment for the overline label.
    label: {
      textTransform: 'uppercase',
    },
    // Horizontal rail padding + inter-chip spacing.
    rail: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    // A single rounded search chip.
    chip: {
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    // Pressed feedback.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
