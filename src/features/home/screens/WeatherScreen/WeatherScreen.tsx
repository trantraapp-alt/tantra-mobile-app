// Weather + farming advisory screen, opened from the home header's weather chip.
// Shows current conditions and a 7-day forecast for the user's selected location
// plus simple, rule-based sowing / spraying advisory derived from the forecast.
import { Droplets, MapPinOff } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { EmptyState, ErrorState } from '@/components/empty-state';
import { Spinner } from '@/components/loaders';
import { Header } from '@/components/shared';
import { Screen, Text } from '@/components/ui';
import { localize, type LocalizedText } from '@/features/sell';
import { useGoBack, useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';
import { useAppSelector } from '@/store/hooks';
import { selectSelectedLocation } from '@/store/selectors';

import { useWeatherForecast } from '../../hooks';
import { weatherEmoji, weatherLabel } from '../../utils/weather';
import {
  buildAdvisory,
  dayLabel,
  type SprayWindow,
  sprayWindow,
} from '../../utils/weatherAdvisory';
import { createWeatherScreenStyles } from './WeatherScreen.styles';

// Screen-local bilingual copy (kept out of the global i18n catalog).
const TITLE: LocalizedText = { en: 'Weather', hi: 'मौसम' };
const ADVISORY_TITLE: LocalizedText = {
  en: 'Farming advisory',
  hi: 'कृषि सलाह',
};
const FORECAST_TITLE: LocalizedText = {
  en: '7-day forecast',
  hi: '7-दिन का पूर्वानुमान',
};
const LEGEND: LocalizedText = {
  en: 'Dot = spraying window',
  hi: 'बिंदु = छिड़काव का समय',
};
const NO_LOCATION_TITLE: LocalizedText = {
  en: 'Set your location',
  hi: 'अपना स्थान चुनें',
};
const NO_LOCATION_DESC: LocalizedText = {
  en: 'Choose a location on Home to see local weather and farming advisory.',
  hi: 'स्थानीय मौसम और कृषि सलाह देखने के लिए होम पर स्थान चुनें।',
};

// Renders the weather + farming advisory screen.
export function WeatherScreen() {
  const styles = useThemedStyles(createWeatherScreenStyles);
  const theme = useTheme();
  const goBack = useGoBack();
  const { t, language } = useTranslation();
  const selected = useAppSelector(selectSelectedLocation);
  const lat = selected?.latitude ?? null;
  const lng = selected?.longitude ?? null;
  const { forecast, isLoading, isError, reload } = useWeatherForecast(lat, lng);

  const place =
    selected?.district?.trim() ||
    selected?.city?.trim() ||
    selected?.state?.trim() ||
    '';

  // Spray-window rating → theme color for the forecast dots.
  const sprayColor: Record<SprayWindow, string> = {
    good: theme.colors.success,
    caution: theme.colors.warning,
    avoid: theme.colors.danger,
  };

  const renderBody = () => {
    if (lat == null || lng == null) {
      return (
        <View style={styles.center}>
          <EmptyState
            icon={MapPinOff}
            title={localize(NO_LOCATION_TITLE, language)}
            description={localize(NO_LOCATION_DESC, language)}
          />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.center}>
          <ErrorState onRetry={reload} retryLabel={t('common.retry')} />
        </View>
      );
    }
    if (isLoading || !forecast) {
      return (
        <View style={styles.center}>
          <Spinner />
        </View>
      );
    }

    const today = forecast.days[0];
    const advisory = buildAdvisory(forecast);

    return (
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>
            {weatherEmoji(forecast.current.code)}
          </Text>
          <Text color="textPrimary" style={styles.heroTemp}>
            {`${forecast.current.tempC}°`}
          </Text>
          <Text variant="body" color="textSecondary">
            {localize(weatherLabel(forecast.current.code), language)}
          </Text>
          {place ? (
            <Text variant="label" color="textPrimary">
              {place}
            </Text>
          ) : null}
          {today ? (
            <Text variant="caption" color="textTertiary">
              {`H ${today.tempMaxC}°   L ${today.tempMinC}°`}
            </Text>
          ) : null}
        </View>

        {advisory.length > 0 ? (
          <View style={styles.card}>
            <Text variant="h4">{localize(ADVISORY_TITLE, language)}</Text>
            {advisory.map((tip) => (
              <View key={tip.key} style={styles.tipRow}>
                <View
                  style={[
                    styles.tipDot,
                    { backgroundColor: theme.colors[tip.tone] },
                  ]}
                />
                <View style={styles.tipText}>
                  <Text variant="label" color="textPrimary">
                    {localize(tip.title, language)}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    {localize(tip.text, language)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text variant="h4">{localize(FORECAST_TITLE, language)}</Text>
          <View style={styles.legend}>
            <View
              style={[styles.sprayDot, { backgroundColor: theme.colors.success }]}
            />
            <Text variant="caption" color="textTertiary">
              {localize(LEGEND, language)}
            </Text>
          </View>
          {forecast.days.map((day, index) => (
            <View key={day.date} style={styles.dayRow}>
              <View
                style={[
                  styles.sprayDot,
                  { backgroundColor: sprayColor[sprayWindow(day)] },
                ]}
              />
              <Text variant="label" color="textPrimary" style={styles.dayName}>
                {localize(dayLabel(day.date, index), language)}
              </Text>
              <Text style={styles.dayEmoji}>{weatherEmoji(day.code)}</Text>
              <View style={styles.dayRain}>
                <Droplets size={theme.sizing.iconXs} color={theme.colors.info} />
                <Text variant="caption" color="textSecondary">
                  {`${day.precipProbPct}%`}
                </Text>
              </View>
              <Text variant="label" color="textPrimary" style={styles.dayTemp}>
                {`${day.tempMaxC}° / ${day.tempMinC}°`}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <Screen padded={false}>
      <Header showBack onBack={goBack} title={localize(TITLE, language)} />
      {renderBody()}
    </Screen>
  );
}
