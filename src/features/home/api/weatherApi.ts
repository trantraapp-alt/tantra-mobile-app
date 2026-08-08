// Current-weather client backed by Open-Meteo (free, public, no API key). Uses
// plain fetch (not the app http client) since it's an external service that
// needs none of our auth / lang / base-URL wiring.
import type { WeatherDay, WeatherForecast, WeatherNow } from '../types';

// Request timeout for the weather call.
const TIMEOUT_MS = 8000;

// Coerces a possibly-missing numeric field to a number (0 when absent).
function num(value: number | undefined): number {
  return Number(value ?? 0);
}

// Fetches the current temperature and condition code for a coordinate.
export async function getWeather(lat: number, lng: number): Promise<WeatherNow> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weather_code`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Weather request failed: ${response.status}`);
    }
    const json = (await response.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const current = json.current ?? {};
    return {
      tempC: Math.round(Number(current.temperature_2m ?? 0)),
      code: Number(current.weather_code ?? 0),
    };
  } finally {
    clearTimeout(timeout);
  }
}

// Fetches current conditions plus a 7-day daily forecast for a coordinate.
export async function getWeatherForecast(
  lat: number,
  lng: number,
): Promise<WeatherForecast> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,` +
    `precipitation_sum,precipitation_probability_max,wind_speed_10m_max` +
    `&timezone=auto&forecast_days=7`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Weather forecast request failed: ${response.status}`);
    }
    const json = (await response.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
      daily?: {
        time?: string[];
        weather_code?: number[];
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
        precipitation_sum?: number[];
        precipitation_probability_max?: number[];
        wind_speed_10m_max?: number[];
      };
    };
    const current = json.current ?? {};
    const daily = json.daily ?? {};
    const times = daily.time ?? [];
    const days: WeatherDay[] = times.map((date, index) => ({
      date,
      code: num(daily.weather_code?.[index]),
      tempMaxC: Math.round(num(daily.temperature_2m_max?.[index])),
      tempMinC: Math.round(num(daily.temperature_2m_min?.[index])),
      precipMm: num(daily.precipitation_sum?.[index]),
      precipProbPct: Math.round(num(daily.precipitation_probability_max?.[index])),
      windMaxKmh: Math.round(num(daily.wind_speed_10m_max?.[index])),
    }));
    return {
      current: {
        tempC: Math.round(num(current.temperature_2m)),
        code: num(current.weather_code),
      },
      days,
    };
  } finally {
    clearTimeout(timeout);
  }
}
