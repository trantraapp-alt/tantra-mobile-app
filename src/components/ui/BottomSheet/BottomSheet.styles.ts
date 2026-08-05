// Style factory for the shared BottomSheet component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds shared bottom sheet styles from the active theme.
export function createBottomSheetStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Sheet surface background.
    background: {
      backgroundColor: theme.colors.background,
    },
    // Drag handle indicator.
    handleIndicator: {
      width: theme.spacing.xxl,
      backgroundColor: theme.colors.border,
    },
    // Content wrapper; horizontal/top padding is constant, bottom padding is
    // applied inline so it can include the device safe-area inset.
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      gap: theme.spacing.xl,
    },
    // Title / subtitle block.
    header: {
      gap: theme.spacing.xxs,
    },
    // Fills the sheet height so the scroll body can scroll above the keyboard.
    flex: {
      flex: 1,
    },
    // Sticky footer bar (its own surface + top divider). It sits above the
    // system-nav inset (via BottomSheetFooter); this base bottom padding keeps
    // the buttons off the bezel on devices with no system nav bar.
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
      backgroundColor: theme.colors.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
  });
}
