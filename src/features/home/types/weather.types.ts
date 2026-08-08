// Current-weather snapshot shown on the home header's weather chip.
export interface WeatherNow {
  // Current temperature in whole degrees Celsius.
  tempC: number;
  // WMO weather-interpretation code (drives the condition icon).
  code: number;
}

// A single day in the daily forecast.
export interface WeatherDay {
  // ISO date (YYYY-MM-DD).
  date: string;
  // WMO weather-interpretation code.
  code: number;
  // Daily max / min temperature in whole degrees Celsius.
  tempMaxC: number;
  tempMinC: number;
  // Total precipitation (mm) and the day's max chance of precipitation (%).
  precipMm: number;
  precipProbPct: number;
  // Max wind speed (km/h).
  windMaxKmh: number;
}

// Current conditions plus a multi-day daily forecast, shown on the weather
// screen and used to derive the farming advisory.
export interface WeatherForecast {
  // Current conditions (same shape as the header chip).
  current: WeatherNow;
  // The daily forecast, one entry per day (today first).
  days: WeatherDay[];
}
