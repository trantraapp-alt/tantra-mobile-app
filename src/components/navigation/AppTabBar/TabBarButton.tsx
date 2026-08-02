// A single tab button (icon + label) within the custom tab bar.
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { LucideIcon } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { Pressable } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import type { TranslationKey } from '@/i18n';
import { useTheme } from '@/providers';

import { createTabBarButtonStyles } from './TabBarButton.styles';

// Translation key for each tab's label.
const TAB_LABEL_KEYS: Record<string, TranslationKey> = {
  home: 'tab.home',
  nearby: 'tab.nearby',
  chat: 'tab.chat',
  wishlist: 'tab.wishlist',
  profile: 'tab.profile',
};

// Props for the TabBarButton component.
export interface TabBarButtonProps {
  // Navigation route key.
  routeKey: string;
  // Navigation route name (used as the fallback label).
  routeName: string;
  // Icon for the tab.
  icon: LucideIcon;
  // Whether this tab is currently active.
  isFocused: boolean;
  // Navigation helpers from the tab navigator.
  navigation: BottomTabBarProps['navigation'];
}

// Capitalizes a route name for display.
function toLabel(routeName: string): string {
  return routeName.charAt(0).toUpperCase() + routeName.slice(1);
}

// Renders a single tab bar button.
function TabBarButtonComponent({
  routeKey,
  routeName,
  icon: Icon,
  isFocused,
  navigation,
}: TabBarButtonProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createTabBarButtonStyles);
  const { t } = useTranslation();
  const tint = isFocused ? theme.colors.primary : theme.colors.textTertiary;
  const labelKey = TAB_LABEL_KEYS[routeName];
  const label = labelKey ? t(labelKey) : toLabel(routeName);

  // Navigates to the tab, following the React Navigation tab-press contract.
  const handlePress = useCallback(() => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routeKey,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  }, [navigation, routeKey, routeName, isFocused]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      onPress={handlePress}
      style={styles.button}
    >
      <Icon size={theme.sizing.iconLg} color={tint} />
      <Text
        variant="overline"
        color={isFocused ? 'primary' : 'textTertiary'}
        style={styles.label}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Memoized tab bar button.
export const TabBarButton = memo(TabBarButtonComponent);
