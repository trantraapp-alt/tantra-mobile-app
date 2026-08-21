// Style factory for the SellCategoryTile component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Disc the category's mark sits on, and the mark inside it.
const MARK_DISC = 62;
const MARK = 31;

// Round arrow chips: solid on the stacked card, softer on the wide one.
const ARROW = 27;
const ARROW_WIDE = 29;

// Shortest a card may be, so paired cards keep a consistent block shape.
const CARD_MIN_HEIGHT = 150;
const CARD_WIDE_MIN_HEIGHT = 92;

// Builds category card styles from the active theme.
export function createSellCategoryTileStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Half-width slot: two per row, spread by the grid.
    slot: {
      width: '48%',
    },
    // Full-width slot for the wide variant.
    slotWide: {
      width: '100%',
    },
    // Card surface. `flex: 1` lets paired cards in a row match the taller of
    // the two, so a two-line blurb never leaves a card stranded short.
    card: {
      flex: 1,
      minHeight: CARD_MIN_HEIGHT,
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
    },
    // Wide variant: mark, text and arrow on one centred row.
    cardWide: {
      minHeight: CARD_WIDE_MIN_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    // White disc the mark sits on, lifted off the tinted card.
    markDisc: {
      width: MARK_DISC,
      height: MARK_DISC,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.card,
      ...theme.shadows.soft,
    },
    // Emoji glyph marking the category.
    markEmoji: {
      fontSize: MARK,
      lineHeight: MARK + theme.spacing.sm,
    },
    // A registered image standing in for the glyph.
    markImage: {
      width: MARK,
      height: MARK + theme.spacing.sm,
    },
    // Name over blurb. Takes the free width in the wide variant.
    labels: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // Solid arrow chip, pinned to the stacked card's bottom corner.
    arrow: {
      position: 'absolute',
      right: theme.spacing.md,
      bottom: theme.spacing.md,
      width: ARROW,
      height: ARROW,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Softer arrow chip closing the wide card's row.
    arrowWide: {
      width: ARROW_WIDE,
      height: ARROW_WIDE,
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
