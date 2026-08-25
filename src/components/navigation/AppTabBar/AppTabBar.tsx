// Custom bottom tab bar rendering Home / Wishlist / Profile with a raised
// central Sell action button. An admin account gets Users in place of Nearby
// and Category in place of Saved, and has no Sell button — it moderates the
// app rather than listing anything on it.
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Heart,
  Home,
  LayoutGrid,
  type LucideIcon,
  MapPin,
  User,
  Users,
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
  // Swaps Nearby for Users, Saved for Category, and hides the Sell button —
  // an admin moderates the app, it doesn't browse or sell on the marketplace.
  isAdmin?: boolean;
}

// Maps a tab route name to its icon.
const ROUTE_ICONS: Record<string, LucideIcon> = {
  home: Home,
  nearby: MapPin,
  users: Users,
  wishlist: Heart,
  categories: LayoutGrid,
  profile: User,
};

// Renders the custom bottom tab bar.
export function AppTabBar({
  state,
  navigation,
  onSellPress,
  isAdmin = false,
}: AppTabBarProps) {
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
        {isAdmin ? renderTab('users') : renderTab('nearby')}
      </View>

      {isAdmin ? null : <SellFab onPress={onSellPress} />}

      <View style={styles.group}>
        {isAdmin ? renderTab('categories') : renderTab('wishlist')}
        {renderTab('profile')}
      </View>
    </View>
  );
}
