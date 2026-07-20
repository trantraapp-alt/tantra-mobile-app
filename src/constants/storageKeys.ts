// Canonical keys used for secure storage, async storage and redux-persist.
export const secureStorageKeys = {
  accessToken: 'tantra.secure.accessToken',
  refreshToken: 'tantra.secure.refreshToken',
} as const;

// Non-sensitive keys stored in the MMKV / AsyncStorage layer.
export const storageKeys = {
  onboardingComplete: 'tantra.onboardingComplete',
  themePreference: 'tantra.themePreference',
  recentSearches: 'tantra.recentSearches',
  persistRoot: 'tantra.persist.root',
} as const;

export type SecureStorageKey =
  (typeof secureStorageKeys)[keyof typeof secureStorageKeys];
export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
