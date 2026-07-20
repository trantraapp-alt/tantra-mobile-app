// Single source of truth for the auth token, backed by secure storage with an
// in-memory cache for synchronous access inside Axios interceptors.
// The backend issues one long-lived JWT and has no refresh endpoint.
import { secureStorageKeys } from '@/constants';

import { secureStorage } from '../storage';

// In-memory snapshot of the current token for fast, synchronous reads.
let cachedToken: string | null = null;

// Returns the currently cached access token, if any.
function getAccessToken(): string | null {
  return cachedToken;
}

// Persists a new token to secure storage and updates the cache.
async function setAccessToken(token: string): Promise<void> {
  cachedToken = token;
  await secureStorage.setItem(secureStorageKeys.accessToken, token);
}

// Clears the token from cache and secure storage.
async function clearTokens(): Promise<void> {
  cachedToken = null;
  await secureStorage.removeItem(secureStorageKeys.accessToken);
}

// Hydrates the in-memory cache from secure storage on app start.
async function bootstrap(): Promise<string | null> {
  cachedToken = await secureStorage.getItem(secureStorageKeys.accessToken);
  return cachedToken;
}

// Token store facade shared by the auth layer and networking interceptors.
export const tokenStore = {
  getAccessToken,
  setAccessToken,
  clearTokens,
  bootstrap,
} as const;
