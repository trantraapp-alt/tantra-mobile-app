// Style factory for the HomeFilterSheet.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds HomeFilterSheet styles from the active theme.
export function createHomeFilterSheetStyles(theme: AppTheme) {
  return StyleSheet.create({
    content: {
      gap: theme.spacing.lg,
    },
    group: {
      gap: theme.spacing.sm,
    },
    groupLabel: {
      marginBottom: theme.spacing.xxs,
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    chip: {
      borderRadius: theme.radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    rangeRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    // Plain themed text field for the price / location inputs (a gorhom
    // BottomSheetTextInput so the sheet lifts it above the keyboard).
    input: {
      flex: 1,
      height: 44,
      borderRadius: theme.radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      color: theme.colors.textPrimary,
      fontSize: 15,
    },
    footerRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    footerBtn: {
      flex: 1,
    },
    state: {
      paddingVertical: theme.spacing.xl,
      alignItems: 'center',
      textAlign: 'center',
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
