import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Styles for the compact SortSelect field + its option sheet.
export const createSortSelectStyles = (theme: AppTheme) =>
  StyleSheet.create({
    // Compact pill trigger: "Sort" label + current value + chevron.
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.borderStrong,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.background,
    },
    pressed: {
      opacity: theme.opacity.pressed,
    },
    // Modal backdrop anchoring the option sheet to the bottom.
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
    handle: {
      alignSelf: 'center',
      width: theme.spacing.huge,
      height: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.border,
      marginBottom: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    options: {
      gap: theme.spacing.xxs,
      paddingBottom: theme.spacing.sm,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.md,
    },
    optionActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    optionLabel: {
      flex: 1,
    },
  });
