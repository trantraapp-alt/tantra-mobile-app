// Redux slice tracking which listings the user has wishlisted, so every card's
// heart reflects the same state. Holds only ids (O(1) lookup); the full items
// are fetched on the wishlist screen. Kept pure (no feature imports): the
// wishlist API calls live in the useSavedListing hook, which dispatches these.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { clearAuth, logoutThunk } from './authSlice';

// Shape of the saved-listings slice state.
export interface SavedState {
  // Wishlisted listing ids for O(1) heart lookups.
  map: Record<string, true>;
  // Whether the wishlist ids have been fetched this session.
  loaded: boolean;
}

// Initial saved state.
const initialState: SavedState = {
  map: {},
  loaded: false,
};

// Saved-listings slice.
const savedSlice = createSlice({
  name: 'saved',
  initialState,
  reducers: {
    // Replaces the whole set from a wishlist fetch and marks it loaded.
    setSavedIds(state, action: PayloadAction<string[]>) {
      const map: Record<string, true> = {};
      for (const id of action.payload) {
        if (id) {
          map[id] = true;
        }
      }
      state.map = map;
      state.loaded = true;
    },
    // Marks a single listing wishlisted (optimistic add).
    markSaved(state, action: PayloadAction<string>) {
      state.map[action.payload] = true;
    },
    // Clears a single listing (optimistic remove).
    unmarkSaved(state, action: PayloadAction<string>) {
      delete state.map[action.payload];
    },
    // Resets on sign-out.
    resetSaved(state) {
      state.map = {};
      state.loaded = false;
    },
  },
  // Clear the wishlist ids when the session ends so a different user never sees
  // the previous user's saved hearts.
  extraReducers: (builder) => {
    builder
      .addCase(clearAuth, () => initialState)
      .addCase(logoutThunk.fulfilled, () => initialState);
  },
});

export const { setSavedIds, markSaved, unmarkSaved, resetSaved } =
  savedSlice.actions;

export const savedReducer = savedSlice.reducer;
