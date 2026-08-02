// Current-weather client backed by Open-Meteo (free, public, no API key). Uses
// plain fetch (not the app http client) since it's an external service that
// needs none of our auth / lang / base-URL wiring.
import type { WeatherNow } from '../types';

// Request timeout for the weather call.
const TIMEOUT_MS = 8000;

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
