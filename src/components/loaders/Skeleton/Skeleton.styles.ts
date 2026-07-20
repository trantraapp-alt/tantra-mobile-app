// Style factory for the Skeleton placeholder.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds skeleton styles from the active theme.
export function createSkeletonStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Base placeholder block.
    block: {
      backgroundColor: theme.colors.skeletonBase,
    },
  });
}
