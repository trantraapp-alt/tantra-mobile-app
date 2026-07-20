// Style factory for the EmptyState component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds empty-state styles from the active theme.
export function createEmptyStateStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Centered container.
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xxl,
      gap: theme.spacing.sm,
    },
    // Circular icon backdrop.
    iconWrapper: {
      width: theme.sizing.avatarXl,
      height: theme.sizing.avatarXl,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      marginBottom: theme.spacing.md,
    },
    // Title spacing.
    title: {
      marginBottom: theme.spacing.xxs,
    },
    // Action button spacing.
    action: {
      marginTop: theme.spacing.lg,
    },
  });
}
