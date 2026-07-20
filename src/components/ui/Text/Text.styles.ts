// Style factory for the themed Text primitive.
import { StyleSheet } from 'react-native';

import type { AppTheme } from '@/theme';

// Builds text styles for variants, semantic colors and alignment.
export function createTextStyles(theme: AppTheme) {
  return StyleSheet.create({
    // Baseline applied to every text node.
    base: {
      color: theme.colors.textPrimary,
    },

    // Typography variants.
    display: theme.typography.display,
    h1: theme.typography.h1,
    h2: theme.typography.h2,
    h3: theme.typography.h3,
    h4: theme.typography.h4,
    bodyLarge: theme.typography.bodyLarge,
    body: theme.typography.body,
    bodyMedium: theme.typography.bodyMedium,
    caption: theme.typography.caption,
    label: theme.typography.label,
    overline: theme.typography.overline,
    button: theme.typography.button,

    // Semantic colors.
    textPrimary: { color: theme.colors.textPrimary },
    textSecondary: { color: theme.colors.textSecondary },
    textTertiary: { color: theme.colors.textTertiary },
    textInverse: { color: theme.colors.textInverse },
    primary: { color: theme.colors.primary },
    secondary: { color: theme.colors.secondary },
    danger: { color: theme.colors.danger },
    success: { color: theme.colors.success },
    warning: { color: theme.colors.warning },
    onPrimary: { color: theme.colors.onPrimary },

    // Alignment.
    auto: { textAlign: 'auto' },
    left: { textAlign: 'left' },
    right: { textAlign: 'right' },
    center: { textAlign: 'center' },
    justify: { textAlign: 'justify' },
  });
}
