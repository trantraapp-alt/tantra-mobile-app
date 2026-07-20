// Style factory for the RadioGroup component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds radio group styles from the active theme.
export function createRadioGroupStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Outer container.
    container: {
      width: '100%',
    },
    // Inline layout: label and options share a single row to save height.
    inlineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      minHeight: theme.sizing.minTouchTarget,
    },
    // Stacked label above the options.
    label: {
      marginBottom: theme.spacing.xs,
    },
    // Inline label may shrink so the options always fit.
    labelInline: {
      flexShrink: 1,
    },
    // Horizontal row of radio options.
    options: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    // A single radio option (indicator + label).
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    // Outer radio ring.
    indicator: {
      width: theme.sizing.iconMd,
      height: theme.sizing.iconMd,
      borderRadius: theme.radius.pill,
      borderWidth: theme.spacing.xxs,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Ring color when the option is selected.
    indicatorSelected: {
      borderColor: theme.colors.primary,
    },
    // Filled inner dot shown when selected.
    dot: {
      width: theme.spacing.md,
      height: theme.spacing.md,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
    },
    // Error message below the group.
    error: {
      marginTop: theme.spacing.xs,
    },
  });
}
