// Redux slice owning global UI state: theme preference, connectivity and search history.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { appConstants } from '@/constants';
import type { PreferredLanguage } from '@/types';

// User theme preference including following the system setting.
export type ThemePreference = 'light' | 'dark' | 'system';

// Shape of the UI slice state.
export interface UiState {
  // Persisted theme preference.
  themePreference: ThemePreference;
  // Active app language, controlled by the header switcher (defaults to English).
  language: PreferredLanguage;
  // Whether the device is currently offline.
  isOffline: boolean;
  // Whether onboarding has been completed.
  hasCompletedOnboarding: boolean;
  // Locally cached recent search terms.
  recentSearches: string[];
}

// Initial UI state.
const initialState: UiState = {
  themePreference: 'system',
  language: 'EN',
  isOffline: false,
  hasCompletedOnboarding: false,
  recentSearches: [],
};

// UI slice managing presentation-level global state.
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sets the user's theme preference.
    setThemePreference(state, action: PayloadAction<ThemePreference>) {
      state.themePreference = action.payload;
    },
    // Sets the active app language.
    setLanguage(state, action: PayloadAction<PreferredLanguage>) {
      state.language = action.payload;
    },
    // Updates the offline connectivity flag.
    setOffline(state, action: PayloadAction<boolean>) {
      state.isOffline = action.payload;
    },
    // Marks onboarding as completed.
    completeOnboarding(state) {
      state.hasCompletedOnboarding = true;
    },
    // Adds a term to the recent searches, de-duplicated and capped.
    addRecentSearch(state, action: PayloadAction<string>) {
      const term = action.payload.trim();
      if (!term) {
        return;
      }
      state.recentSearches = [
        term,
        ...state.recentSearches.filter((entry) => entry !== term),
      ].slice(0, appConstants.maxRecentSearches);
    },
    // Clears the recent search history.
    clearRecentSearches(state) {
      state.recentSearches = [];
    },
  },
});

export const {
  setThemePreference,
  setLanguage,
  setOffline,
  completeOnboarding,
  addRecentSearch,
  clearRecentSearches,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;
