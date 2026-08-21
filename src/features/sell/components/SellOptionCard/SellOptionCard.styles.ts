// Style factory for the SellOptionCard component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds sell-option card styles from the active theme.
export function createSellOptionCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Half-width slot: two per row, spread by the sheet's grid.
    slot: {
      width: '48%',
    },
    // Card surface. `flex: 1` lets paired cards match the taller of the two, so
    // a two-line name never leaves its neighbour stranded short.
    card: {
      flex: 1,
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
    },
    // Name and arrow on one row, so the arrow costs the card no height.
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // The module name, taking the row's free width.
    name: {
      flex: 1,
    },
    // Round arrow chip closing the row.
    arrow: {
      width: theme.sizing.iconXl,
      height: theme.sizing.iconXl,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Round tile the picture sits on, lifted off the tinted card.
    pictureTile: {
      width: theme.sizing.avatarLg,
      height: theme.sizing.avatarLg,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.card,
    },
    // The picture itself.
    picture: {
      width: '68%',
      height: '68%',
    },
    // Emoji glyph shown when a module has no picture.
    emoji: {
      fontSize: 30,
      lineHeight: 36,
    },
    // Pressed feedback.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
