// Simple, rule-based farming advisory derived from the daily forecast: a
// spraying-suitability rating per day plus a few actionable tips (spraying /
// irrigation / field work). Heuristics only — a helpful nudge, not a substitute
// for local agronomy guidance.
import type { LocalizedText } from '@/features/sell';

import type { WeatherDay, WeatherForecast } from '../types';

// How suitable a day is for spraying agrochemicals.
export type SprayWindow = 'good' | 'caution' | 'avoid';

// Rates a day's spraying suitability from its rain, wind and heat. Rain washes
// off spray, wind causes drift, and extreme heat degrades many products.
export function sprayWindow(day: WeatherDay): SprayWindow {
  if (day.precipProbPct >= 60 || day.precipMm >= 5 || day.windMaxKmh >= 25) {
    return 'avoid';
  }
  if (day.precipProbPct >= 30 || day.windMaxKmh >= 18 || day.tempMaxC >= 38) {
    return 'caution';
  }
  return 'good';
}

// Short weekday labels (index = Date.getDay()).
const WEEKDAYS: LocalizedText[] = [
  { en: 'Sun', hi: 'रवि' },
  { en: 'Mon', hi: 'सोम' },
  { en: 'Tue', hi: 'मंगल' },
  { en: 'Wed', hi: 'बुध' },
  { en: 'Thu', hi: 'गुरु' },
  { en: 'Fri', hi: 'शुक्र' },
  { en: 'Sat', hi: 'शनि' },
];

// A bilingual label for a forecast day ("Today" for the first entry).
export function dayLabel(dateISO: string, index: number): LocalizedText {
  if (index === 0) {
    return { en: 'Today', hi: 'आज' };
  }
  return WEEKDAYS[new Date(dateISO).getDay()] ?? { en: '', hi: '' };
}

// A single advisory line rendered on the weather screen.
export interface AdvisoryTip {
  // Stable React key.
  key: string;
  // Semantic tone (maps to a theme color for the leading dot).
  tone: 'success' | 'warning' | 'danger' | 'info';
  // Bilingual heading and body.
  title: LocalizedText;
  text: LocalizedText;
}

const SPRAYING: LocalizedText = { en: 'Spraying', hi: 'छिड़काव' };
const IRRIGATION: LocalizedText = { en: 'Irrigation', hi: 'सिंचाई' };
const FIELD_WORK: LocalizedText = { en: 'Field work', hi: 'खेत का काम' };

// Builds the farming-advisory tips from a forecast.
export function buildAdvisory(forecast: WeatherForecast): AdvisoryTip[] {
  const days = forecast.days;
  const tips: AdvisoryTip[] = [];
  if (days.length === 0) {
    return tips;
  }

  // Spraying — surface the first clear window in the week.
  const goodIndex = days.findIndex((day) => sprayWindow(day) === 'good');
  const goodDay = goodIndex >= 0 ? days[goodIndex] : undefined;
  if (goodIndex === 0) {
    tips.push({
      key: 'spray',
      tone: 'success',
      title: SPRAYING,
      text: {
        en: 'Good conditions to spray today — calm and dry.',
        hi: 'आज छिड़काव के लिए अच्छी स्थिति — शांत और सूखा।',
      },
    });
  } else if (goodDay) {
    const label = dayLabel(goodDay.date, goodIndex);
    tips.push({
      key: 'spray',
      tone: 'warning',
      title: SPRAYING,
      text: {
        en: `Hold spraying today; the best window is ${label.en}.`,
        hi: `आज छिड़काव न करें; सबसे अच्छा दिन ${label.hi} है।`,
      },
    });
  } else {
    tips.push({
      key: 'spray',
      tone: 'danger',
      title: SPRAYING,
      text: {
        en: 'Unsettled week — no clear spraying window.',
        hi: 'अस्थिर सप्ताह — छिड़काव के लिए स्पष्ट समय नहीं।',
      },
    });
  }

  // Irrigation — rain within the next three days lets the grower hold water.
  const rainIndex = days
    .slice(0, 3)
    .findIndex((day) => day.precipProbPct >= 60 || day.precipMm >= 5);
  const rainDay = rainIndex >= 0 ? days[rainIndex] : undefined;
  if (rainDay) {
    const label = dayLabel(rainDay.date, rainIndex);
    tips.push({
      key: 'irrigate',
      tone: 'info',
      title: IRRIGATION,
      text: {
        en: `Rain likely ${label.en} — you can hold irrigation.`,
        hi: `${label.hi} बारिश संभव — सिंचाई रोक सकते हैं।`,
      },
    });
  } else {
    tips.push({
      key: 'irrigate',
      tone: 'warning',
      title: IRRIGATION,
      text: {
        en: 'No rain expected — irrigate in the early morning or evening.',
        hi: 'बारिश की संभावना नहीं — सुबह या शाम सिंचाई करें।',
      },
    });
  }

  // Field work — flag heat over the next two days.
  const hot = days.slice(0, 2).some((day) => day.tempMaxC >= 38);
  tips.push(
    hot
      ? {
          key: 'heat',
          tone: 'danger',
          title: FIELD_WORK,
          text: {
            en: 'High heat — avoid midday field work and stay hydrated.',
            hi: 'अधिक गर्मी — दोपहर में खेत का काम न करें और पानी पिएं।',
          },
        }
      : {
          key: 'heat',
          tone: 'success',
          title: FIELD_WORK,
          text: {
            en: 'Comfortable conditions for field work.',
            hi: 'खेत के काम के लिए अनुकूल स्थिति।',
          },
        },
  );

  return tips;
}
