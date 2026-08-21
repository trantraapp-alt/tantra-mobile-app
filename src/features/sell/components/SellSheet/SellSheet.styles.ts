// Style factory for the SellSheet component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds sell sheet styles from the active theme.
export function createSellSheetStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Brand mark, title block and close button on one row.
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    // Tinted circle carrying the leaf mark.
    brand: {
      width: theme.sizing.minTouchTarget,
      height: theme.sizing.minTouchTarget,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryLight,
    },
    // Title over subtitle, taking the space between mark and close button.
    titles: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // Circular close button. IconButton puts this style on its outer wrapper,
    // so the round background and border are drawn here rather than via its
    // `filled` preset (which would tint it surface-variant grey).
    close: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      ...theme.shadows.soft,
    },
    // Two-column grid of module cards, as the design pairs them. The columns
    // are spread rather than gapped, so two 48% cards always share a row
    // however narrow the phone.
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: theme.spacing.md,
    },
    // Half-width slot for a loading placeholder (matches a real card's slot).
    placeholderSlot: {
      width: '48%',
    },
  });
}
