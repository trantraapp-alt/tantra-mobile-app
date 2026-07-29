// Style factory for the SellCategoryForm wrapper.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds sell category form wrapper styles from the active theme.
export function createSellCategoryFormStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Centered wrapper for the loading and error states.
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    // Subcategory picker scroll content.
    pickerContent: {
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    // Form-shaped loading skeleton content.
    formSkeleton: {
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    // One labeled input placeholder inside the form skeleton.
    fieldSkeleton: {
      gap: theme.spacing.xs,
    },
    // Two-column grid of subcategory boxes.
    pickerGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    // One subcategory box (two per row).
    pickerBox: {
      width: '48%',
    },
    // Box contents: icon tile above the name.
    pickerBoxInner: {
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Square icon tile inside a subcategory box.
    pickerTile: {
      width: theme.sizing.avatarXl,
      height: theme.sizing.avatarXl,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Category image filling the icon tile.
    pickerTileImage: {
      width: '64%',
      height: '64%',
    },
    // Wraps the leaf header + form.
    leafWrap: {
      flex: 1,
    },
    // Wraps the info banner + the leaf listing form.
    leafFormWrap: {
      flex: 1,
    },
    // Padding around the info banner shown above the form.
    leafInfo: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    // Back row shown above a drilled-in leaf form.
    leafHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
    },
  });
}
