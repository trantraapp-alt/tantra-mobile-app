// Root application layout: mounts global providers and the auth-gated navigator.
import 'react-native-reanimated';
import '@/theme/global.css';

import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppSplash } from '@/components/loaders';
import { routes } from '@/constants';
import { useAuth, useAuthBootstrap } from '@/features/auth';
import { AppProviders, useColorSchemeName } from '@/providers';

// Keep the native splash visible until the animated splash overlay takes over.
void SplashScreen.preventAutoHideAsync();

// Renders a status bar styled for the active color scheme.
function ThemedStatusBar() {
  const scheme = useColorSchemeName();
  return <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />;
}

// Handles session bootstrap and redirects between auth and app route groups.
function RootNavigator() {
  useAuthBootstrap();
  const { isAuthenticated, isBootstrapped } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isBootstrapped) {
      return;
    }
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace(routes.auth.login);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace(routes.tabs.home);
    }
  }, [isAuthenticated, isBootstrapped, segments, router]);

  if (!isBootstrapped) {
    return <AppSplash />;
  }

  return (
    <>
      <ThemedStatusBar />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

// Application root wrapping the navigator in the global provider tree.
export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
