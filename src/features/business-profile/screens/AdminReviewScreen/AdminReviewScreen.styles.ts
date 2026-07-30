// Screen-level styles for AdminReviewScreen — the shared profile body's
// styles live in BusinessProfileView.styles.ts.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

export function createAdminReviewStyles(theme: AppTheme) {
  return StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    // Sticky action shelf — Approve / Reject / Block.
    actionButtons: {
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    reasonSheet: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
  });
}
