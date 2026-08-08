// Colored, dense home header matching the reference design (re-skinned to the
// app's primary/secondary theme): a brand wordmark with notification + language
// actions on the top row, a full-width tap-through search field on its own row,
// and a "location bar" with the selected district, a radius pill and a weather
// chip. Filters are not shown on home (discovery only) — they live on the browse
// screens. Fixed at the top of the home screen (it owns the status-bar inset so
// the color runs edge to edge).
import { useRouter } from 'expo-router';
import { Bell, ChevronDown, MapPin, Search } from 'lucide-react-native';
import { memo, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type BottomSheetRef, Text } from '@/components/ui';
import { routes } from '@/constants';
import { useLanguage, useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectSearchRadius, selectSelectedLocation } from '@/store/selectors';
import { setRadius } from '@/store/slices';

import { useWeather } from '../../hooks';
import { weatherEmoji } from '../../utils/weather';
import { LocationPickerSheet } from '../LocationPickerSheet';
import {
  createHomeHeaderStyles,
  FIELD_INK,
  FIELD_PLACEHOLDER,
} from './HomeHeader.styles';

// Radius presets (km) the header chip cycles through.
const RADIUS_PRESETS = [5, 10, 25, 50, 100];

// Props for the HomeHeader component.
export interface HomeHeaderProps {
  // Opens the search screen.
  onSearchPress: () => void;
}

// Renders the home header.
function HomeHeaderComponent({ onSearchPress }: HomeHeaderProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createHomeHeaderStyles);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { language, toggle } = useLanguage();
  const router = useRouter();
  const selected = useAppSelector(selectSelectedLocation);
  const radiusKm = useAppSelector(selectSearchRadius);
  const dispatch = useAppDispatch();
  const weather = useWeather(selected?.latitude, selected?.longitude);
  const sheetRef = useRef<BottomSheetRef>(null);

  const place = selected?.district?.trim() || selected?.city?.trim() || '';
  const stateName = selected?.state?.trim() ?? '';
  const locationLabel =
    place && stateName
      ? `${place}, ${stateName}`
      : place || stateName || t('location.setLocation');

  const openLocation = () => sheetRef.current?.present();

  // Tapping the radius chip cycles through the presets (persisted).
  const cycleRadius = () => {
    const index = RADIUS_PRESETS.indexOf(radiusKm);
    const next = RADIUS_PRESETS[(index + 1) % RADIUS_PRESETS.length] ?? 25;
    dispatch(setRadius(next));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topRow}>
        <View style={styles.logo}>
          <Text variant="h3" color="onPrimary">
            Tan
          </Text>
          <Text variant="h3" color="secondary">
            tra
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push(routes.notifications)}
            accessibilityRole="button"
            accessibilityLabel={t('common.notifications')}
          >
            {({ pressed }) => (
              <View style={[styles.glassIcon, pressed ? styles.pressed : null]}>
                <Bell size={theme.sizing.iconSm} color={theme.colors.onPrimary} />
                <View style={styles.notifDot} />
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel={`Switch language, currently ${language}`}
          >
            {({ pressed }) => (
              <View style={[styles.langPill, pressed ? styles.pressed : null]}>
                <Text variant="overline" color="onPrimary">
                  {language === 'HI' ? 'हिं' : 'EN'}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.searchRow}>
        <Pressable
          style={styles.searchField}
          onPress={onSearchPress}
          accessibilityRole="search"
          accessibilityLabel={t('home.searchPlaceholder')}
        >
          <Search size={theme.sizing.iconSm} color={FIELD_INK} />
          <Text
            variant="caption"
            numberOfLines={1}
            style={[styles.searchText, { color: FIELD_PLACEHOLDER }]}
          >
            {t('home.searchPlaceholder')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.locBar}>
        <Pressable
          style={styles.locPressable}
          onPress={openLocation}
          accessibilityRole="button"
          accessibilityLabel={t('location.change')}
        >
          {({ pressed }) => (
            <View style={[styles.locRow, pressed ? styles.pressed : null]}>
              <View style={styles.locContent}>
                <MapPin
                  size={theme.sizing.iconXs}
                  color={theme.colors.onPrimary}
                />
                <Text
                  variant="label"
                  color="onPrimary"
                  numberOfLines={1}
                  style={styles.locValue}
                >
                  {locationLabel}
                </Text>
              </View>
              <ChevronDown
                size={theme.sizing.iconXs}
                color={theme.colors.onPrimary}
              />
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={cycleRadius}
          accessibilityRole="button"
          accessibilityLabel={t('market.filters.radius')}
        >
          {({ pressed }) => (
            <View style={[styles.radiusPill, pressed ? styles.pressed : null]}>
              <Text variant="overline" color="secondary">
                {`${radiusKm} km`}
              </Text>
              <ChevronDown
                size={theme.sizing.iconXxs}
                color={theme.colors.secondary}
              />
            </View>
          )}
        </Pressable>

        {weather ? (
          <Pressable
            onPress={() => router.push(routes.weather)}
            accessibilityRole="button"
            accessibilityLabel={language === 'HI' ? 'मौसम' : 'Weather'}
          >
            {({ pressed }) => (
              <View
                style={[styles.weatherPill, pressed ? styles.pressed : null]}
              >
                <Text variant="overline" color="onPrimary">
                  {`${weatherEmoji(weather.code)} ${weather.tempC}°C`}
                </Text>
              </View>
            )}
          </Pressable>
        ) : null}
      </View>

      <LocationPickerSheet ref={sheetRef} />
    </View>
  );
}

// Memoized home header.
export const HomeHeader = memo(HomeHeaderComponent);
