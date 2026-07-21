// Style factory for the DynamicListingForm renderer.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds dynamic listing form styles from the active theme.
export function createDynamicListingFormStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Fills the right pane.
    container: {
      flex: 1,
    },
    // Keyboard avoider fills the container.
    flex: {
      flex: 1,
    },
    // Scrollable form content above the sticky footer.
    content: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.xl,
    },
    // Title / subtitle block.
    intro: {
      gap: theme.spacing.xxs,
    },
    // A titled group of fields.
    section: {
      gap: theme.spacing.md,
    },
    // Fields stacked within a section.
    sectionFields: {
      gap: theme.spacing.md,
    },
    // Sticky footer holding the primary action.
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    // Read-only computed field wrapper.
    readOnly: {
      gap: theme.spacing.xs,
    },
    // Read-only value box.
    readOnlyBox: {
      minHeight: theme.sizing.inputHeightSm,
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    // Locked (not editable on update) value box: value + lock icon.
    lockedBox: {
      minHeight: theme.sizing.inputHeightSm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    // Hint shown under a locked field.
    lockedHint: {
      marginTop: theme.spacing.xxs,
    },
    // Image upload field wrapper.
    imageUpload: {
      gap: theme.spacing.xs,
    },
    // Dashed "add photos" tile.
    imageTile: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xxl,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
  });
}
