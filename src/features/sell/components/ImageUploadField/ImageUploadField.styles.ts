// Style factory for the ImageUploadField component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds image upload styles from the active theme.
export function createImageUploadFieldStyles(theme: AppTheme) {
  const tile = theme.sizing.avatarLg + theme.spacing.lg;

  return StyleSheet.create({
    // Outer container.
    container: {
      width: '100%',
      gap: theme.spacing.xs,
    },
    // Wrapping grid of thumbnails and the add tile.
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    // Thumbnail wrapper (positions the remove button).
    thumbWrap: {
      width: tile,
      height: tile,
    },
    // Uploaded image thumbnail.
    thumb: {
      width: '100%',
      height: '100%',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Circular remove button on a thumbnail.
    removeButton: {
      position: 'absolute',
      top: -theme.spacing.xs,
      right: -theme.spacing.xs,
      width: theme.sizing.iconLg,
      height: theme.sizing.iconLg,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.danger,
    },
    // Dashed "add photo" tile.
    addTile: {
      width: tile,
      height: tile,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xxs,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
  });
}
