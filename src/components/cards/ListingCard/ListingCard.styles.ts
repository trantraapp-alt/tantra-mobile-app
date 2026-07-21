// Style factory for the ListingCard component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds listing card styles from the active theme.
export function createListingCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Tappable content area (image + details).
    content: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
    },
    // Thumbnail image.
    image: {
      width: theme.sizing.avatarXl,
      height: theme.sizing.avatarXl,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Placeholder shown when there is no image.
    imagePlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Details column.
    body: {
      flex: 1,
      gap: theme.spacing.xxs,
    },
    // Row holding the status badge (and any trailing meta).
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xxs,
    },
    // Title spacing.
    title: {
      marginBottom: theme.spacing.xxs,
    },
    // Actions footer under the content.
    footer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
  });
}
