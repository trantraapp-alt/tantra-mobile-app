// Bottom tab navigator (Home, Wishlist, Profile) with a central Sell button
// that opens the Sell bottom sheet. An admin account gets Users in place of
// Nearby and Category in place of Saved, and no Sell button — it moderates
// the app, it doesn't browse or sell on the marketplace.
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
        <Tabs.Screen
          name="wishlist"
          options={{ title: 'Saved', href: isAdmin ? null : undefined }}
        />
        <Tabs.Screen
          name="categories"
          options={{ title: 'Categories', href: isAdmin ? undefined : null }}
        />
        <Tabs.Screen name="profile" options={{ title: 'Me' }} />
      </Tabs>

      {/* Not mounted for admin — its module fetch would run for nothing since
          the Sell button that opens it is hidden for that role. */}
      {isAdmin ? null : <SellSheet ref={sellSheetRef} />}
    </>
  );
}
