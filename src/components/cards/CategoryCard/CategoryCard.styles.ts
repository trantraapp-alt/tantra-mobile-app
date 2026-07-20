// Style factory for the CategoryCard component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds category card styles from the active theme.
export function createCategoryCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Card container.
    container: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      width: theme.sizing.avatarXl,
    },
    // Circular category image.
    image: {
      width: theme.sizing.avatarXl,
      height: theme.sizing.avatarXl,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Category label.
    label: {
      width: '100%',
    },
  });
}
