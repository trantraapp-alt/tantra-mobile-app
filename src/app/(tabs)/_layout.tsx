// Bottom tab navigator (Home, Wishlist, Profile) with a central Sell button
// that opens the Sell bottom sheet.
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { useRef } from 'react';

import { AppTabBar } from '@/components/navigation';
import { SellSheet, type SellSheetRef } from '@/features/sell';

// Configures the app's bottom tab navigation with a custom tab bar.
export default function TabsLayout() {
  const sellSheetRef = useRef<SellSheetRef>(null);

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props: BottomTabBarProps) => (
          <AppTabBar
            {...props}
            onSellPress={() => sellSheetRef.current?.present()}
          />
        )}
      >
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
        <Tabs.Screen name="wishlist" options={{ title: 'Wishlist' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>

      <SellSheet ref={sellSheetRef} />
    </>
  );
}
