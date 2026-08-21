// Style factory for the shared ListingHeader.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds ListingHeader styles from the active theme.
export function createListingHeaderStyles(theme: AppTheme) {
  return StyleSheet.create({
    // SafeAreaView wrapper carrying the brand gradient behind the status bar.
    // The flat `primary` fill stays as paint-behind so the bar never flashes
    // white while the SVG mounts, and `overflow: hidden` clips the
    // deliberately over-tall backdrop to the header's real height.
    safeWrap: {
      backgroundColor: theme.colors.primary,
      overflow: 'hidden',
    },
    // Row: back button, title/search block, action icons.
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
    },
    // Back button: white pill so it reads clearly against the gradient, the
    // same treatment the listing-detail header uses. The search and filter
    // icons are plain white instead — three stacked pills crowd the bar.
    iconBtn: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.pill,
    },
    // Title + count take the free space; a fixed height (matching the search
    // bar) keeps the header height constant when toggling search — no flicker.
    titleBlock: {
      flex: 1,
      minWidth: 0,
      height: theme.sizing.inputHeight,
      justifyContent: 'center',
    },
    // The count sits under the title in the same white, dimmed so the title
    // still leads. A grey would muddy against the gradient.
    resultLabel: {
      opacity: theme.opacity.muted,
    },
    // The in-header search bar takes the free space — same fixed height as the
    // title block so the header never jumps.
    searchWrap: {
      flex: 1,
      height: theme.sizing.inputHeight,
      justifyContent: 'center',
    },
  });
}
