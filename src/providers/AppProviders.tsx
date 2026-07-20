// Composes every global provider into a single root wrapper for the app.
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import type { PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { commonStyles } from '@/utils/commonStyles';

import { FontProvider } from './FontProvider';
import { LocaleSync } from './LocaleSync';
import { SplashGate } from './SplashGate';
import { StoreProvider } from './StoreProvider';
import { TamaguiThemeProvider } from './TamaguiThemeProvider';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';

// Root provider tree ordered from outermost infrastructure to UI concerns.
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={commonStyles.flexOne}>
      <StoreProvider>
        <ThemeProvider>
          <TamaguiThemeProvider>
            <SafeAreaProvider>
              <FontProvider>
                <BottomSheetModalProvider>
                  <LocaleSync />
                  <ToastProvider>
                    <SplashGate>{children}</SplashGate>
                  </ToastProvider>
                </BottomSheetModalProvider>
              </FontProvider>
            </SafeAreaProvider>
          </TamaguiThemeProvider>
        </ThemeProvider>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
