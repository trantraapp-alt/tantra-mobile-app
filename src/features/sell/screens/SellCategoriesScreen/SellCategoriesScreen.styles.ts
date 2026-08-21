// Style factory for the SellCategoriesScreen.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds sell categories screen styles from the active theme.
export function createSellCategoriesStyles(_theme: AppTheme) {
  return StyleSheet.create({
    // The header's accent bloom, pinned to the top-right corner behind
    // everything else. Its width is set at render from the window.
    glow: {
      position: 'absolute',
      top: 0,
      right: 0,
    },
    // Everything under the header: the module's category browse page, or the
    // full-screen listing form once a category is open.
    body: {
      flex: 1,
    },
  });
}
