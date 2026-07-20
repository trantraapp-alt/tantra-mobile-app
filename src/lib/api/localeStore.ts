// Holds the active API language, sent as the `lang` query param on every
// request. Kept outside Redux so Axios interceptors can read it synchronously.
import type { PreferredLanguage } from '@/types';

// Current API language; defaults to English until the user selects otherwise.
let currentLanguage: PreferredLanguage = 'EN';

// Returns the language sent with API requests.
function getLanguage(): PreferredLanguage {
  return currentLanguage;
}

// Sets the language sent with API requests.
function setLanguage(language: PreferredLanguage): void {
  currentLanguage = language;
}

// Locale store facade consumed by the networking layer.
export const localeStore = { getLanguage, setLanguage } as const;
