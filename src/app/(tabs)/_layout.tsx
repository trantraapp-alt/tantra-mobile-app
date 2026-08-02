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
        <Tabs.Screen name="nearby" options={{ title: 'Nearby' }} />
        <Tabs.Screen name="chat" options={{ title: 'Chat', href: null }} />
        <Tabs.Screen name="wishlist" options={{ title: 'Saved' }} />
        <Tabs.Screen name="profile" options={{ title: 'Me' }} />
      </Tabs>

      <SellSheet ref={sellSheetRef} />
    </>
  );
}
