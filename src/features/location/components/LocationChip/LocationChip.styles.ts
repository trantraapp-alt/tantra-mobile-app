// Style factory for the LocationChip component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds location chip styles from the active theme.
export function createLocationChipStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Tappable chip row.
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      maxWidth: theme.sizing.avatarXl + theme.spacing.huge,
    },
    // Label text block.
    textWrap: {
      flexShrink: 1,
    },
    // Row holding the label and the chevron.
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    // Location label (truncates when long).
    label: {
      flexShrink: 1,
    },
  });
}
