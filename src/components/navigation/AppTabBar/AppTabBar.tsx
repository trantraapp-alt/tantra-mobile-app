// Custom bottom tab bar rendering Home / Wishlist / Profile with a raised
// central Sell action button.
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Heart,
  Home,
  type LucideIcon,
  MapPin,
  User,
} from 'lucide-react-native';
import { Platform, View } from 'react-native';

import { useBottomInset, useThemedStyles } from '@/hooks';

import { createAppTabBarStyles } from './AppTabBar.styles';
import { SellFab } from './SellFab';
import { TabBarButton } from './TabBarButton';

// Props for the AppTabBar component.
export interface AppTabBarProps extends BottomTabBarProps {
  // Called when the central Sell button is pressed.
  onSellPress: () => void;
}

// Maps a tab route name to its icon.
const ROUTE_ICONS: Record<string, LucideIcon> = {
  home: Home,
  nearby: MapPin,
  wishlist: Heart,
  profile: User,
};

// Renders the custom bottom tab bar.
export function AppTabBar({ state, navigation, onSellPress }: AppTabBarProps) {
  const styles = useThemedStyles(createAppTabBarStyles);
  const bottomInset = useBottomInset();

  // Finds a route index by name so layout order is independent of definition order.
  const indexOf = (name: string) =>
    state.routes.findIndex((route) => route.name === name);

  // Renders a single tab button for the route with the given name.
  const renderTab = (name: string) => {
    const index = indexOf(name);
    const route = state.routes[index];
    if (!route) {
      return null;
    }
    return (
      <TabBarButton
        routeKey={route.key}
        routeName={route.name}
        icon={ROUTE_ICONS[name] ?? Home}
        isFocused={state.index === index}
        navigation={navigation}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: Platform.OS === 'ios' ? 10 : bottomInset }]}>
      <View style={styles.group}>
        {renderTab('home')}
        {renderTab('nearby')}
      </View>

      <SellFab onPress={onSellPress} />

      <View style={styles.group}>
        {renderTab('wishlist')}
        {renderTab('profile')}
      </View>
    </View>
  );
}
