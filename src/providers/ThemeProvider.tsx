// Resolves the active app theme from user preference and system scheme,
// and exposes it via context alongside NativeWind color-scheme syncing.
import { colorScheme as nativewindColorScheme } from 'nativewind';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useColorScheme } from 'react-native';

import { useAppSelector } from '@/store/hooks';
import { selectThemePreference } from '@/store/selectors';
import { type AppTheme, type ColorSchemeName, themes } from '@/theme';

// Value exposed to consumers of the theme context.
interface ThemeContextValue {
  // Fully resolved active theme.
  theme: AppTheme;
  // Active color scheme name.
  scheme: ColorSchemeName;
}

// Theme context; undefined until provided so misuse fails loudly.
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Provides the resolved theme to the component tree.
export function ThemeProvider({ children }: PropsWithChildren) {
  const preference = useAppSelector(selectThemePreference);
  const systemScheme = useColorScheme();

  // Resolve the concrete scheme, honoring the "system" preference.
  const scheme: ColorSchemeName = useMemo(() => {
    if (preference === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return preference;
  }, [preference, systemScheme]);

  // Keep NativeWind's color scheme in sync with the resolved scheme.
  useEffect(() => {
    nativewindColorScheme.set(scheme);
  }, [scheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: themes[scheme], scheme }),
    [scheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Returns the active theme, throwing if used outside the provider.
export function useTheme(): AppTheme {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context.theme;
}

// Returns the active color scheme name, throwing if used outside the provider.
export function useColorSchemeName(): ColorSchemeName {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useColorSchemeName must be used within a ThemeProvider');
  }
  return context.scheme;
}
