// Style factory for the SellOptionCard component.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds sell-option card styles from the active theme.
export function createSellOptionCardStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Layout for the card contents; surface styling comes from the Card.
    // flex:1 lets the module cards share the row equally.
    container: {
      flex: 1,
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    // Medium square icon tile — big enough to keep the card roughly square,
    // without filling the whole card width.
    imageArea: {
      width: theme.sizing.avatarLg + theme.spacing.xxl,
      height: theme.sizing.avatarLg + theme.spacing.xxl,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
    },
    // Remote module image filling the icon tile.
    image: {
      width: '80%',
      height: '80%',
    },
    // Emoji glyph shown when there is no remote image (matches the Home
    // "Browse Categories" tiles).
    emoji: {
      fontSize: 40,
      lineHeight: 46,
    },
  });
}
