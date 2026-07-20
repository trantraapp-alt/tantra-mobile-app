// Bridges the app color scheme into Tamagui's provider.
import type { PropsWithChildren } from 'react';
import { TamaguiProvider } from 'tamagui';

import tamaguiConfig from '../../tamagui.config';
import { useColorSchemeName } from './ThemeProvider';

// Provides the Tamagui design system with the active color scheme.
export function TamaguiThemeProvider({ children }: PropsWithChildren) {
  const scheme = useColorSchemeName();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={scheme}>
      {children}
    </TamaguiProvider>
  );
}
