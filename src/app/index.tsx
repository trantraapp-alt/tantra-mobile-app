// Entry route that defers to the auth gate by redirecting into the app group.
import { Redirect } from 'expo-router';

import { routes } from '@/constants';

// Redirects to the home tab; the root auth gate reroutes unauthenticated users.
export default function Index() {
  return <Redirect href={routes.tabs.home} />;
}
