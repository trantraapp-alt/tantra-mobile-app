// Loads the app's Inter font family and gates rendering until ready.
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import type { PropsWithChildren } from 'react';

import { AppSplash } from '@/components/loaders/AppSplash';

// Blocks rendering with a splash until the app fonts have loaded.
export function FontProvider({ children }: PropsWithChildren) {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return <AppSplash />;
  }

  return <>{children}</>;
}
