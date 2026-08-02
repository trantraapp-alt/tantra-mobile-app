// Style factory for the FeaturedBusinessCard.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds FeaturedBusinessCard styles from the active theme.
export function createFeaturedBusinessCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Clips the cover to the card's rounded corners.
    clip: {
      overflow: 'hidden',
    },
    // Wide cover image / fallback header.
    cover: {
      width: '100%',
      aspectRatio: 16 / 9,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    coverImage: {
      width: '100%',
      height: '100%',
    },
    // Premium ribbon over the top-right of the cover.
    premiumRibbon: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
    },
    // Text block.
    body: {
      padding: theme.spacing.md,
      gap: theme.spacing.xxs,
    },
    // Name + verified check.
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    name: {
      flexShrink: 1,
    },
    // Locality line.
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    locationText: {
      flex: 1,
    },
    // Pressed feedback.
    pressed: {
      opacity: theme.opacity.pressed,
    },
  });
}
