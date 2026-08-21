// Style factory for the SellCategoryPicker component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// How far the motif is lifted above the heading block: enough to overlap the
// gap under the tabs, but low enough to sit level with the title.
const DECOR_LIFT = -4;

// Accent bar marking the section heading.
const BAR_WIDTH = 4;
const BAR_HEIGHT = 19;

// Builds category browse styles from the active theme.
export function createSellCategoryPickerStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Page scroll content: tabs, heading, grid and support card.
    content: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xxxl,
    },
    // Heading block, with room above it for the tabs.
    section: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.xxl,
    },
    // Field motif tucked into the heading's trailing corner, behind the text:
    // it is drawn before the title, so the heading always paints over it.
    decor: {
      position: 'absolute',
      right: theme.spacing.sm,
      top: DECOR_LIFT,
    },
    // Accent bar and title on one row.
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Short accent bar marking the section.
    bar: {
      width: BAR_WIDTH,
      height: BAR_HEIGHT,
      borderRadius: theme.radius.xs,
    },
    // Supporting line under the heading.
    sectionSub: {
      marginTop: theme.spacing.sm,
    },
    // Two-column grid of category cards. The columns are spread rather than
    // gapped, so two 48% cards always share a row however narrow the phone.
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
    },
    // Half-width slot for a loading placeholder (matches a real card's slot).
    placeholderSlot: {
      width: '48%',
    },
    // Inset around the closing support card (the grid pads itself).
    support: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
    },
  });
}
