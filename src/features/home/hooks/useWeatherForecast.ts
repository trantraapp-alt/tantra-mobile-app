// Loads current conditions + a 7-day forecast for a coordinate (the selected
// location). Exposes loading / error flags and a manual reload so the weather
// screen can show a spinner, an error retry and a refresh.
import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/lib';

import { getWeatherForecast } from '../api/weatherApi';
import type { WeatherForecast } from '../types';

// Result shape returned by useWeatherForecast.
export interface UseWeatherForecastResult {
  // The loaded forecast, or null until loaded / when no coordinate is known.
  forecast: WeatherForecast | null;
  // Whether a request is in flight.
  isLoading: boolean;
  // Whether the last request failed.
  isError: boolean;
  // Re-runs the request (e.g. from an error-state retry).
  reload: () => void;
}

// Fetches the forecast for the given coordinate (skips when absent).
export function useWeatherForecast(
  lat: number | null | undefined,
  lng: number | null | undefined,
): UseWeatherForecastResult {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (lat == null || lng == null) {
      setForecast(null);
      setIsLoading(false);
      setIsError(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    setIsError(false);
    getWeatherForecast(lat, lng)
      .then((next) => {
        if (active) {
          setForecast(next);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (active) {
          logger.warn('[Weather] Failed to load forecast', error);
          setIsError(true);
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [lat, lng, reloadToken]);

  return { forecast, isLoading, isError, reload };
}
