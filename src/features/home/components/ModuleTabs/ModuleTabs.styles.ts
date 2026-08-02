// Style factory for the ModuleTabs strip.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Diameter of each module's circular icon tile.
const CIRCLE = 60;

// Builds ModuleTabs styles from the active theme.
export function createModuleTabsStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Horizontal rail padding + inter-item spacing.
    railContent: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    // One module: circular icon over a centered label.
    item: {
      width: CIRCLE + theme.spacing.sm,
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    // Tinted circular icon tile.
    circle: {
      width: CIRCLE,
      height: CIRCLE,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Centered module name.
    label: {
      textAlign: 'center',
    },
    // Pressed feedback.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
