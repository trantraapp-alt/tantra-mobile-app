// Style factory for the ProductCard component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds product card styles from the active theme.
export function createProductCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Card container.
    container: {
      width: theme.sizing.productCardWidth,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      overflow: 'hidden',
      ...theme.shadows.soft,
    },
    // Image area wrapper.
    imageWrapper: {
      width: '100%',
      height: theme.sizing.productImageHeight,
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Product image.
    image: {
      width: '100%',
      height: '100%',
    },
    // Discount badge position.
    badge: {
      position: 'absolute',
      top: theme.spacing.sm,
      left: theme.spacing.sm,
    },
    // Wishlist toggle position.
    wishlist: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      width: theme.sizing.iconXl,
      height: theme.sizing.iconXl,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.background,
      ...theme.shadows.low,
    },
    // Out-of-stock overlay label.
    outOfStock: {
      position: 'absolute',
      bottom: theme.spacing.sm,
      left: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.radius.xs,
      backgroundColor: theme.colors.overlay,
    },
    // Text body area.
    body: {
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    // Product title spacing.
    title: {
      minHeight: theme.spacing.huge,
    },
  });
}
