// Style factory for the SellTrustBanner component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds trust badge styles from the active theme.
export function createSellTrustBannerStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Shield and line in a tinted pill that hugs its own content, so it reads
    // as a mark on the sheet rather than another card competing with them.
    badge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
    },
  });
}
