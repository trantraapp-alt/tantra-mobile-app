// Style factory for the SegmentedControl component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds segmented control styles from the active theme.
export function createSegmentedControlStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Outer container.
    container: {
      width: '100%',
    },
    // Field label.
    label: {
      marginBottom: theme.spacing.xs,
    },
    // Segment track holding the options.
    track: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.radius.md,
      padding: theme.spacing.xxs,
      gap: theme.spacing.xxs,
    },
    // Individual segment.
    segment: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Selected segment appearance.
    segmentSelected: {
      backgroundColor: theme.colors.primary,
    },
    // Error message below the control.
    error: {
      marginTop: theme.spacing.xs,
    },
  });
}
