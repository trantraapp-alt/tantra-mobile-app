// Style factory for the Select component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds select styles from the active theme.
export function createSelectStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Outer container.
    container: {
      width: '100%',
    },
    // Label above the field.
    label: {
      marginBottom: theme.spacing.xs,
    },
    // The tappable field showing the current value. Sits on the page background
    // (not a filled surface) so an editable field is never mistaken for a
    // disabled/locked one, which uses `surfaceVariant`.
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      height: theme.sizing.inputHeightSm,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.lg,
    },
    // Selected value text fills the row.
    valueText: {
      flex: 1,
    },
    // Error border treatment.
    errored: {
      borderColor: theme.colors.danger,
    },
    // Error message below the field.
    error: {
      marginTop: theme.spacing.xs,
    },
    // Modal backdrop anchoring the sheet to the bottom.
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.colors.overlay,
    },
    // Bottom sheet surface (bottom padding applied inline for the safe area).
    sheet: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.radius.xxl,
      borderTopRightRadius: theme.radius.xxl,
      paddingTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      maxHeight: '70%',
    },
    // Drag indicator at the top of the sheet.
    handle: {
      alignSelf: 'center',
      width: theme.spacing.huge,
      height: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.border,
      marginBottom: theme.spacing.md,
    },
    // Header row: title/description block + close button.
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    // Title + description column fills the header row.
    headerText: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // Scrollable list content padding.
    options: {
      gap: theme.spacing.xxs,
      paddingBottom: theme.spacing.sm,
    },
    // A single option row.
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.md,
    },
    // Highlighted background for the selected option.
    optionActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    // Option label fills the row.
    optionLabel: {
      flex: 1,
    },
  });
}
