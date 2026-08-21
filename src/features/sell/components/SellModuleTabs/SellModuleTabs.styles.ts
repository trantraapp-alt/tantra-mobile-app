// Style factory for the SellModuleTabs component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Width each card takes once there are too many to share the row.
const CARD_WIDTH = 108;

// Size of the emoji mark and of a registered image standing in for it.
const MARK = 30;

// Height of the bar under the active card, and how much of the card it spans.
const UNDERLINE_HEIGHT = 3;
const UNDERLINE_INSET = '22.5%';

// Builds top-category card row styles from the active theme.
export function createSellModuleTabsStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Fitted row: the cards divide the screen width between them.
    row: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xl,
    },
    // Scrolling row, used when the cards no longer fit.
    scrollRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xl,
    },
    // One card's slot in the fitted row. `minWidth: 0` lets the slot shrink
    // below its label's natural width, which is what makes the label wrap.
    slot: {
      flex: 1,
      minWidth: 0,
    },
    // One card's slot in the scrolling row.
    slotFixed: {
      width: CARD_WIDTH,
    },
    // Card surface. `overflow: hidden` keeps the underline inside the corners.
    card: {
      flex: 1,
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      borderRadius: theme.cardRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      overflow: 'hidden',
      ...theme.shadows.soft,
    },
    // Emoji glyph marking the category.
    emoji: {
      fontSize: MARK,
      lineHeight: MARK + theme.spacing.xs,
    },
    // A registered image standing in for the glyph.
    image: {
      width: MARK,
      height: MARK + theme.spacing.xs,
    },
    // Accent bar under the selected card.
    underline: {
      position: 'absolute',
      bottom: 0,
      left: UNDERLINE_INSET,
      right: UNDERLINE_INSET,
      height: UNDERLINE_HEIGHT,
      borderTopLeftRadius: UNDERLINE_HEIGHT,
      borderTopRightRadius: UNDERLINE_HEIGHT,
    },
    // Pressed feedback.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
