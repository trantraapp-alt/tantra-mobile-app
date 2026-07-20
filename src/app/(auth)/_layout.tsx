// Stack layout for the authentication route group.
import { Stack } from 'expo-router';

// Configures the auth stack with headers hidden (screens render their own).
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
