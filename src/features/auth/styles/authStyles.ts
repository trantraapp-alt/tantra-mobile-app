// Shared style factory for all authentication screens.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds common auth screen styles from the active theme.
export function createAuthStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Fills the available space for keyboard avoidance.
    flex: {
      flex: 1,
    },
    // Scroll content wrapper.
    content: {
      flexGrow: 1,
      paddingVertical: theme.spacing.xxl,
      gap: theme.spacing.xl,
    },
    // Brand logo block.
    brand: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    // Title / subtitle header block.
    header: {
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    // Vertically stacked form fields.
    form: {
      gap: theme.spacing.lg,
    },
    // Horizontal row of two fields.
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    // A single item within a two-column row.
    rowItem: {
      flex: 1,
    },
    // Error banner spacing.
    errorBanner: {
      marginTop: theme.spacing.none,
    },
    // Right-aligned forgot-password action.
    forgot: {
      alignSelf: 'flex-end',
    },
    // Centered footer row with a call to action.
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 'auto',
    },
  });
}
