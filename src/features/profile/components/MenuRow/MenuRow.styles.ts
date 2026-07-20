// Style factory for the MenuRow component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds menu row styles from the active theme.
export function createMenuRowStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Row container.
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    // Leading icon backdrop.
    iconWrapper: {
      width: theme.sizing.avatarSm,
      height: theme.sizing.avatarSm,
      borderRadius: theme.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Row label taking remaining space.
    label: {
      flex: 1,
    },
  });
}
