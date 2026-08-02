// Loads the current weather for a coordinate (the selected location). Returns
// null until loaded, or when no coordinate is known — the caller hides the chip.
import { useEffect, useState } from 'react';

import { logger } from '@/lib';

import { getWeather } from '../api/weatherApi';
import type { WeatherNow } from '../types';

// Fetches current weather for the given coordinate (skips when absent).
export function useWeather(
  lat: number | null | undefined,
  lng: number | null | undefined,
): WeatherNow | null {
  const [weather, setWeather] = useState<WeatherNow | null>(null);

  useEffect(() => {
    if (lat == null || lng == null) {
      setWeather(null);
      return;
    }
    let active = true;
    getWeather(lat, lng)
      .then((next) => {
        if (active) {
          setWeather(next);
        }
      })
      .catch((error) => {
        if (active) {
          logger.warn('[Weather] Failed to load current weather', error);
          setWeather(null);
        }
      });
    return () => {
      active = false;
    };
  }, [lat, lng]);

  return weather;
}
