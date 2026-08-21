// Style factory for the SellSupportCard component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Round tile carrying the card's icon.
const ICON_TILE = 38;

// Narrowest the copy may get before the action drops to its own line. Below
// this the title starts breaking mid-word, which reads worse than a wrap.
const MIN_LABEL_WIDTH = 132;

// Builds support card styles from the active theme.
export function createSellSupportCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Icon, copy and action on one row. It wraps rather than squeezing the
    // action off-screen on narrow phones or at large font scales.
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
    },
    // Round tile carrying the icon.
    iconTile: {
      width: ICON_TILE,
      height: ICON_TILE,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.card,
    },
    // Title over its supporting line, taking the free width.
    labels: {
      flex: 1,
      minWidth: MIN_LABEL_WIDTH,
      gap: theme.spacing.xxs,
    },
    // Solid accent pill holding the call to action.
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.pill,
    },
    // Round chevron chip closing the whole-card variant.
    chevron: {
      width: theme.sizing.iconXl,
      height: theme.sizing.iconXl,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Pressed feedback.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
