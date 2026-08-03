// Back navigation that survives a cold entry point. `router.back()` is a no-op
// when the history stack is empty — which is exactly what happens when a screen
// is opened directly from a deep link (`tantra://listing/123`), a push
// notification, or right after a `router.replace`. The header chevron then does
// nothing and reads as a broken button.
//
// This resolves that by falling back to a real destination instead: if there is
// nowhere to go back to, replace the current screen with a sensible parent (the
// home tab by default) so back always leads somewhere.
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { routes } from '@/constants';

// An expo-router href, as accepted by `router.replace`.
type Href = Parameters<ReturnType<typeof useRouter>['replace']>[0];

// Returns a stable "go back" callback. Pass `fallback` to land somewhere other
// than the home tab when there is no history (e.g. the login screen for the
// auth flow).
export function useGoBack(fallback: Href = routes.tabs.home as Href) {
  const router = useRouter();

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(fallback);
  }, [router, fallback]);
}
