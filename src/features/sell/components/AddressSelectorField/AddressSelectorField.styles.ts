// Style factory for the AddressSelectorField component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds address selector styles from the active theme.
export function createAddressSelectorStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Field wrapper: even spacing between the label, picker, preview and action.
    container: {
      gap: theme.spacing.md,
    },
    // Hint shown when the default checkbox is on but no default address exists.
    hint: {
      marginTop: -theme.spacing.xxs,
    },
    // Read-only preview of the selected saved address (readable line spacing).
    preview: {
      gap: theme.spacing.xs,
    },
    // Mobile-number row inside the preview.
    mobileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xxs,
    },
    // Row holding the "create new" action, spaced a little from the preview.
    actions: {
      flexDirection: 'row',
      marginTop: theme.spacing.xxs,
    },
  });
}
