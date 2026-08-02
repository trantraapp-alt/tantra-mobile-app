// Style factory for the LocationPickerSheet.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds LocationPickerSheet styles from the active theme.
export function createLocationPickerSheetStyles(theme: AppTheme) {
  return StyleSheet.create({
    content: {
      gap: theme.spacing.md,
    },
    // Tinted accent row for the "use current location" / "use PIN" actions.
    accentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.radius.md,
    },
    accentText: {
      flex: 1,
      gap: 2,
    },
    addrRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    addrText: {
      flex: 1,
      gap: 2,
    },
    addrLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    addrLabel: {
      flexShrink: 1,
    },
    viewAll: {
      paddingVertical: theme.spacing.sm,
    },
    state: {
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
      textAlign: 'center',
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
