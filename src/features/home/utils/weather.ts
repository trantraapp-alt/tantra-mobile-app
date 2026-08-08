// Shared weather visuals: a condition emoji and a short bilingual label for a
// WMO weather-interpretation code, used by the home header chip and the weather
// screen.
import type { LocalizedText } from '@/features/sell';

// Maps a WMO weather-interpretation code to a compact condition emoji.
export function weatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 95) return '⛈️';
  if (code >= 51) return '🌧️';
  return '☁️';
}

// Maps a WMO code to a short bilingual condition label.
export function weatherLabel(code: number): LocalizedText {
  if (code === 0) return { en: 'Clear', hi: 'साफ़' };
  if (code <= 2) return { en: 'Partly cloudy', hi: 'आंशिक बादल' };
  if (code === 3) return { en: 'Cloudy', hi: 'बादल' };
  if (code === 45 || code === 48) return { en: 'Fog', hi: 'कोहरा' };
  if (code >= 71 && code <= 77) return { en: 'Snow', hi: 'बर्फ़' };
  if (code >= 95) return { en: 'Thunderstorm', hi: 'आंधी-तूफ़ान' };
  if (code >= 51) return { en: 'Rain', hi: 'बारिश' };
  return { en: 'Cloudy', hi: 'बादल' };
}
