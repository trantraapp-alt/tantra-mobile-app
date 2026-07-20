// Style factory for the SellOptionCard component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds sell-option card styles from the active theme.
export function createSellOptionCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Layout for the card contents; surface styling comes from the Card.
    container: {
      flex: 1,
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    // Square image / icon area.
    imageArea: {
      width: '100%',
      aspectRatio: 1,
      maxHeight: theme.sizing.avatarXl + theme.spacing.xl,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Remote module image filling the image area.
    image: {
      width: '80%',
      height: '80%',
    },
  });
}
