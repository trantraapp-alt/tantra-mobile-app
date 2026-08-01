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
    // Sticky action shelf — only the actions valid for the profile's current
    // status (PENDING: Approve + a Reject/Block row; APPROVED: Reject/Block
    // row only; REJECTED/BLOCKED: no actions, just a hint).
    actionButtons: {
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    // Reject + Block sit side by side so two secondary actions cost one row
    // of height instead of two.
    secondaryRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    secondaryButton: {
      flex: 1,
    },
    statusHint: {
      textAlign: 'center',
    },
    reasonSheet: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
  });
}
