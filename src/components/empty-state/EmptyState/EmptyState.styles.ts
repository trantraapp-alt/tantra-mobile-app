// Style factory for the EmptyState component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds empty-state styles from the active theme.
export function createEmptyStateStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Fills its parent and centers the content vertically + horizontally.
    container: {
      flex: 1,
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xxl,
      gap: theme.spacing.xs,
    },
    // Soft outer halo giving the icon depth.
    iconHalo: {
      width: theme.sizing.avatarXl + theme.spacing.xxl,
      height: theme.sizing.avatarXl + theme.spacing.xxl,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      marginBottom: theme.spacing.lg,
    },
    // Tinted inner circle holding the branded icon.
    iconCircle: {
      width: theme.sizing.avatarXl,
      height: theme.sizing.avatarXl,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryLight,
    },
    // Title spacing.
    title: {
      marginBottom: theme.spacing.xxs,
    },
    // Constrain the description so it wraps into tidy, centered lines.
    description: {
      maxWidth: 320,
    },
    // Action button spacing.
    action: {
      marginTop: theme.spacing.lg,
    },
  });
}
