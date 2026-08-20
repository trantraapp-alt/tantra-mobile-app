// Hero home header matching the reference design: a violet→light gradient (with
// an optional farmer illustration behind the brand) carrying the Tantra wordmark
// with notification + language actions, a time-based greeting, a white search bar
// with a mic, and a white location / radius / weather bar. Fixed at the top of
// the home screen — it owns the status-bar inset so the gradient runs edge to
// edge.
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronDown,
  MapPin,
  Mic,
  Navigation,
  Search,
} from 'lucide-react-native';
import { memo, useRef } from 'react';
import {
  ImageBackground,
  type ImageSourcePropType,
  Pressable,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type BottomSheetRef, Text } from '@/components/ui';
import { routes } from '@/constants';
import { localize, type LocalizedText } from '@/features/sell';
import { useLanguage, useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCurrentUser,
  selectSearchRadius,
  selectSelectedLocation,
} from '@/store/selectors';
import { setRadius } from '@/store/slices';

import { useWeather } from '../../hooks';
import { weatherEmoji } from '../../utils/weather';
import { LocationPickerSheet } from '../LocationPickerSheet';
import {
  createHomeHeaderStyles,
  INK,
  INK_SOFT,
} from './HomeHeader.styles';

// Full-bleed farmer illustration used as the header background — its own violet
// gradient and bottom fade are baked into the image, so the header applies no
// colors of its own.
const HERO_SOURCE: ImageSourcePropType = require('../../../../assets/images/home-hero.jpg');

// Radius presets (km) the header chip cycles through.
const RADIUS_PRESETS = [5, 10, 25, 50, 100];

// Time-of-day greetings + the farmer address and subtitle (kept out of the
// global i18n catalog).
const GREETINGS = {
  morning: { en: 'Good Morning', hi: 'सुप्रभात' },
  afternoon: { en: 'Good Afternoon', hi: 'नमस्कार' },
  evening: { en: 'Good Evening', hi: 'शुभ संध्या' },
} satisfies Record<string, LocalizedText>;
const FARMER: LocalizedText = { en: 'Farmer', hi: 'किसान' };
const SUBTITLE: LocalizedText = {
  en: "Let's grow your profit today!",
  hi: 'आज मुनाफ़ा बढ़ाएँ!',
};

// Props for the HomeHeader component.
export interface HomeHeaderProps {
  // Opens the search screen.
  onSearchPress: () => void;
  // Shows the tap-through search field row. Off for the admin dashboard
  // embedding this header, which has no marketplace search of its own.
  showSearch?: boolean;
  // Shows the location/radius/weather bar. Off for the admin dashboard —
  // none of that is relevant outside the buyer/seller feed.
  showLocationBar?: boolean;
}

// Renders the home header.
function HomeHeaderComponent({
  onSearchPress,
  showSearch = true,
  showLocationBar = true,
}: HomeHeaderProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createHomeHeaderStyles);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { language, toggle } = useLanguage();
  const router = useRouter();
  const selected = useAppSelector(selectSelectedLocation);
  const radiusKm = useAppSelector(selectSearchRadius);
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  // Skip the weather fetch entirely when the bar showing it is hidden.
  const weather = useWeather(
    showLocationBar ? selected?.latitude : undefined,
    showLocationBar ? selected?.longitude : undefined,
  );
  const sheetRef = useRef<BottomSheetRef>(null);

  const place = selected?.district?.trim() || selected?.city?.trim() || '';
  const stateName = selected?.state?.trim() ?? '';
  const locationLabel =
    place && stateName
      ? `${place}, ${stateName}`
      : place || stateName || t('location.setLocation');

  const hour = new Date().getHours();
  const greetKey = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  // Greet by first name, falling back to a generic "Farmer".
  const firstName = user?.firstName?.trim();
  const name = firstName || localize(FARMER, language);
  const greeting = `${localize(GREETINGS[greetKey], language)}, ${name} 👋`;

  const openLocation = () => sheetRef.current?.present();

  // Tapping the radius chip cycles through the presets (persisted).
  const cycleRadius = () => {
    const index = RADIUS_PRESETS.indexOf(radiusKm);
    const next = RADIUS_PRESETS[(index + 1) % RADIUS_PRESETS.length] ?? 25;
    dispatch(setRadius(next));
  };

  return (
    <ImageBackground
      source={HERO_SOURCE}
      style={[styles.container, { paddingTop: insets.top }]}
      resizeMode="cover"
    >
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
                <Bell
                  size={theme.sizing.iconSm}
                  color={theme.colors.onPrimary}
                />
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
                <Text variant="label" color="onPrimary">
                  {language === 'HI' ? 'हिं' : 'EN'}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.greeting}>
        <Text variant="h4" color="onPrimary" numberOfLines={1}>
          {greeting}
        </Text>
        <Text
          variant="caption"
          color="onPrimary"
          numberOfLines={1}
          style={styles.greetingSub}
        >
          {localize(SUBTITLE, language)}
        </Text>
      </View>

      {showSearch ? (
        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <Pressable
              style={styles.searchTap}
              onPress={onSearchPress}
              accessibilityRole="search"
              accessibilityLabel={t('home.searchPlaceholder')}
            >
              <Search size={theme.sizing.iconSm} color={INK_SOFT} />
              <Text
                variant="body"
                numberOfLines={1}
                style={[styles.searchText, { color: INK_SOFT }]}
              >
                {t('home.searchPlaceholder')}
              </Text>
            </Pressable>
            <Pressable
              onPress={onSearchPress}
              accessibilityRole="button"
              accessibilityLabel={t('home.searchPlaceholder')}
            >
              {({ pressed }) => (
                <View style={[styles.mic, pressed ? styles.pressed : null]}>
                  <Mic size={theme.sizing.iconSm} color={theme.colors.onPrimary} />
                </View>
              )}
            </Pressable>
          </View>
        </View>
      ) : null}

      {showLocationBar ? (
        <>
          <View style={styles.locBar}>
            <Pressable
              style={styles.locSeg}
              onPress={openLocation}
              accessibilityRole="button"
              accessibilityLabel={t('location.change')}
            >
              <MapPin size={theme.sizing.iconXs} color={theme.colors.primary} />
              <Text
                variant="label"
                numberOfLines={1}
                style={[styles.locValue, { color: INK }]}
              >
                {locationLabel}
              </Text>
              <ChevronDown size={theme.sizing.iconXs} color={INK_SOFT} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              style={styles.seg}
              onPress={cycleRadius}
              accessibilityRole="button"
              accessibilityLabel={t('market.filters.radius')}
            >
              <Navigation
                size={theme.sizing.iconXs}
                color={theme.colors.secondary}
              />
              <Text variant="label" style={{ color: INK }}>
                {`${radiusKm} km`}
              </Text>
              <ChevronDown size={theme.sizing.iconXxs} color={INK_SOFT} />
            </Pressable>

            {weather ? (
              <>
                <View style={styles.divider} />
                <Pressable
                  style={styles.seg}
                  onPress={() => router.push(routes.weather)}
                  accessibilityRole="button"
                  accessibilityLabel={language === 'HI' ? 'मौसम' : 'Weather'}
                >
                  <Text variant="label" style={{ color: INK }}>
                    {`${weatherEmoji(weather.code)} ${weather.tempC}°C`}
                  </Text>
                </Pressable>
              </>
            ) : null}
          </View>

          <LocationPickerSheet ref={sheetRef} />
        </>
      ) : null}
    </ImageBackground>
  );
}

// Memoized home header.
export const HomeHeader = memo(HomeHeaderComponent);
