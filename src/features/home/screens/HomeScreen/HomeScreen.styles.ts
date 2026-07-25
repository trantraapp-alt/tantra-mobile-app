// Style factory for the HomeScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds home screen styles from the active theme.
export function createHomeStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Scroll content padding.
    content: {
      padding: theme.spacing.lg,
      gap: theme.spacing.xl,
    },
    // Brand top bar row.
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    // Logo + wordmark lockup.
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Two-tone "Tantra" wordmark.
    wordmark: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    // Trailing action icons in the top bar.
    topActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Greeting row: greeting text on the left, location chip on the right.
    greetingRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    // Greeting text block.
    greeting: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // Featured section wrapper with a minimum height for the empty state.
    section: {
      minHeight: theme.sizing.bannerHeight,
    },
  });
}
