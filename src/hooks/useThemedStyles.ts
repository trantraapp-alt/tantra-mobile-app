// Memoizes a theme-derived StyleSheet so styles recompute only on theme change.
import { useMemo } from 'react';

import { useTheme } from '@/providers';
import type { AppTheme } from '@/theme';

// Factory that builds a style object from the active theme.
type StyleFactory<TStyles> = (theme: AppTheme) => TStyles;

// Returns memoized styles created from the active theme.
export function useThemedStyles<TStyles>(
  factory: StyleFactory<TStyles>,
): TStyles {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
