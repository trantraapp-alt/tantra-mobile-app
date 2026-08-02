// Current-weather snapshot shown on the home header's weather chip.
export interface WeatherNow {
  // Current temperature in whole degrees Celsius.
  tempC: number;
  // WMO weather-interpretation code (drives the condition icon).
  code: number;
}
