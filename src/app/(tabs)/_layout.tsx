// Bottom tab navigator (Home, Wishlist, Profile) with a central Sell button
// that opens the Sell bottom sheet. An admin account gets a Users tab in
// place of Nearby — it moderates the app, it doesn't browse the marketplace.
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { useRef } from 'react';

import { AppTabBar } from '@/components/navigation';
import { useAuth } from '@/features/auth';
import { SellSheet, type SellSheetRef } from '@/features/sell';

// Configures the app's bottom tab navigation with a custom tab bar.
export default function TabsLayout() {
  const sellSheetRef = useRef<SellSheetRef>(null);
  const { user } = useAuth();
  const isAdmin = user?.appUsageRole === 'ADMIN';

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props: BottomTabBarProps) => (
          <AppTabBar
            {...props}
            isAdmin={isAdmin}
            onSellPress={() => sellSheetRef.current?.present()}
          />
        )}
      >
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen
          name="nearby"
          options={{ title: 'Nearby', href: isAdmin ? null : undefined }}
        />
        <Tabs.Screen
          name="users"
          options={{ title: 'Users', href: isAdmin ? undefined : null }}
        />
        <Tabs.Screen name="chat" options={{ title: 'Chat', href: null }} />
        <Tabs.Screen name="wishlist" options={{ title: 'Saved' }} />
        <Tabs.Screen name="profile" options={{ title: 'Me' }} />
      </Tabs>

      <SellSheet ref={sellSheetRef} />
    </>
  );
}
