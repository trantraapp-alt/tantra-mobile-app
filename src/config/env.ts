// Strongly-typed runtime environment resolved from Expo config and public env vars.
import Constants from 'expo-constants';

// Supported application environments.
export type AppEnvironment = 'development' | 'staging' | 'production';

// Shape of the resolved runtime configuration.
export interface AppEnv {
  // Base URL for all API requests.
  apiBaseUrl: string;
  // Default request timeout in milliseconds.
  apiTimeoutMs: number;
  // Active application environment.
  environment: AppEnvironment;
  // Convenience flag for development builds.
  isDevelopment: boolean;
  // Convenience flag for production builds.
  isProduction: boolean;
}

// Reads a public env var first (so `.env` can override per environment),
// then the Expo `extra` block, then a hard-coded default.
function readValue(
  extraKey: string,
  envValue: string | undefined,
  fallback: string,
): string {
  if (typeof envValue === 'string' && envValue.length > 0) {
    return envValue;
  }

  const extra = Constants.expoConfig?.extra as
    | Record<string, unknown>
    | undefined;
  const fromExtra = extra?.[extraKey];

  if (typeof fromExtra === 'string' && fromExtra.length > 0) {
    return fromExtra;
  }
  return fallback;
}

// Resolves and validates the application environment configuration.
function resolveEnv(): AppEnv {
  const apiBaseUrl = readValue(
    'apiBaseUrl',
    process.env.EXPO_PUBLIC_API_BASE_URL,
    'https://api.tantra.example.com',
  );

  const apiTimeoutMs = Number.parseInt(
    readValue(
      'apiTimeoutMs',
      process.env.EXPO_PUBLIC_API_TIMEOUT_MS,
      '45000',
    ),
    10,
  );

  const environment = readValue(
    'environment',
    process.env.EXPO_PUBLIC_ENVIRONMENT,
    'production',
  ) as AppEnvironment;

  return {
    apiBaseUrl,
    apiTimeoutMs: Number.isFinite(apiTimeoutMs) ? apiTimeoutMs : 45000,
    environment,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
  };
}

// Singleton runtime environment consumed across the app.
export const env: AppEnv = resolveEnv();
