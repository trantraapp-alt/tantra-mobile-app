// Style factory for the Avatar component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds avatar styles from the active theme.
export function createAvatarStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Remote image avatar.
    image: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Initials fallback avatar.
    fallback: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
  });
}
