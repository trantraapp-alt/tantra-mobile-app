// Screen-level styles for BusinessProfileDetailScreen — the shared profile
// body's styles live in BusinessProfileView.styles.ts.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createBPDetailScreenStyles(theme: AppTheme) {
  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    // Sticky action shelf — Edit / Edit & Resubmit, or the blocked notice.
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      gap: theme.spacing.sm,
    },
    footerHint: {
      textAlign: 'center',
      fontSize: theme.fontSize.xs,
    },
  });
}
