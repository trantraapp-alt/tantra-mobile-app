// Profile screen: user summary, navigation menu, theme toggle and logout.
import { useRouter } from 'expo-router';
import {
  Bell,
  Briefcase,
  Heart,
  LogOut,
  MapPin,
  Moon,
  Package,
  Settings,
  ShieldCheck,
  Store,
  Ticket,
} from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { Header } from '@/components/shared';
import { Avatar, Divider, Screen, Text } from '@/components/ui';
import { routes } from '@/constants';
import { useAuth, useLogout } from '@/features/auth';
import { useThemedStyles } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectThemePreference } from '@/store/selectors';
import { setThemePreference, type ThemePreference } from '@/store/slices';
import { getUserFullName } from '@/utils';

import { MenuRow } from '../../components';
import { createProfileStyles } from './ProfileScreen.styles';

// Ordered cycle of theme preferences toggled from the profile screen.
const THEME_CYCLE: ThemePreference[] = ['system', 'light', 'dark'];

// Renders the profile screen.
export function ProfileScreen() {
  const styles = useThemedStyles(createProfileStyles);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { logout, isPending } = useLogout();
  const themePreference = useAppSelector(selectThemePreference);

  // Advances the theme preference to the next option in the cycle.
  const cycleTheme = useCallback(() => {
    const currentIndex = THEME_CYCLE.indexOf(themePreference);
    const next = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length];
    dispatch(setThemePreference(next ?? 'system'));
  }, [dispatch, themePreference]);

  const isAdmin = user?.appUsageRole === 'ADMIN';

  // Navigation menu configuration. An admin account only moderates business
  // profiles — it has no listings, orders, wishlist or saved addresses of its
  // own, so those buyer/seller-only entries are dropped for it, and the
  // admin's own moderation dashboard is added instead.
  const menu = useMemo(() => {
    const items = [
      { key: 'listings', icon: Store, label: 'My listings', onPress: () => router.push(routes.listings), hideForAdmin: true },
      { key: 'businessProfiles', icon: Briefcase, label: 'My Business Profiles', onPress: () => router.push(routes.businessProfile.list), hideForAdmin: true },
      { key: 'orders', icon: Package, label: 'My orders', onPress: () => router.push(routes.orders), hideForAdmin: true },
      { key: 'wishlist', icon: Heart, label: 'Wishlist', onPress: () => router.push(routes.tabs.wishlist), hideForAdmin: true },
      { key: 'coupons', icon: Ticket, label: 'Coupons', onPress: () => router.push(routes.coupons) },
      { key: 'notifications', icon: Bell, label: 'Notifications', onPress: () => router.push(routes.notifications) },
      { key: 'addresses', icon: MapPin, label: 'Addresses', onPress: () => router.push(routes.addresses), hideForAdmin: true },
      { key: 'settings', icon: Settings, label: 'Settings', onPress: () => router.push(routes.settings) },
    ].filter((item) => !item.hideForAdmin || !isAdmin);

    return isAdmin
      ? [
          ...items,
          {
            key: 'businessProfileAdmin',
            icon: ShieldCheck,
            label: 'Business Profile Admin',
            onPress: () => router.push(routes.admin.businessProfile),
          },
        ]
      : items;
  }, [router, isAdmin]);

  return (
    <Screen padded={false}>
      <Header title="Profile" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userCard}>
          <Avatar
            name={user ? getUserFullName(user) : 'Guest'}
            uri={user?.avatarUrl}
            size="lg"
          />
          <View style={styles.userInfo}>
            <Text variant="h4">
              {user ? getUserFullName(user) : 'Guest user'}
            </Text>
            <Text variant="caption" color="textSecondary">
              {user?.mobileNumber ?? 'Not signed in'}
            </Text>
          </View>
        </View>

        <Divider spaced />

        <View style={styles.menu}>
          {menu.map((entry) => (
            <MenuRow
              key={entry.key}
              icon={entry.icon}
              label={entry.label}
              onPress={entry.onPress}
            />
          ))}
          <MenuRow
            icon={Moon}
            label={`Appearance: ${themePreference}`}
            onPress={cycleTheme}
          />
        </View>

        <Divider spaced />

        <MenuRow
          icon={LogOut}
          label={isPending ? 'Signing out…' : 'Log out'}
          destructive
          onPress={logout}
        />
      </ScrollView>
    </Screen>
  );
}
