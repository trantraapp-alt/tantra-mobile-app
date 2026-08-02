// The user's selected location, persisted so it survives restarts and does not
// re-prompt. Set from a GPS fix or a PIN lookup; drives the home-screen chip and
// pre-fills listing/address flows.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// A stored, display-ready location.
export interface StoredLocation {
  // Short label shown on the chip (city / district).
  label: string;
  // City / town.
  city: string;
  // District.
  district: string;
  // State.
  state: string;
  // PIN / postal code.
  pinCode: string;
  // Latitude, when known.
  latitude: number | null;
  // Longitude, when known.
  longitude: number | null;
}

// Location slice state.
export interface LocationState {
  // The user's selected location, or null when unset.
  selected: StoredLocation | null;
  // Search radius (km) for nearby results; shown on the home header chip.
  radiusKm: number;
}

// Default search radius in kilometres.
export const DEFAULT_RADIUS_KM = 25;

// Initial location state.
const initialState: LocationState = {
  selected: null,
  radiusKm: DEFAULT_RADIUS_KM,
};

// Location slice reducer + actions.
const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    // Sets the selected location.
    setLocation: (state, action: PayloadAction<StoredLocation>) => {
      state.selected = action.payload;
    },
    // Clears the selected location.
    clearLocation: (state) => {
      state.selected = null;
    },
    // Sets the nearby search radius (km).
    setRadius: (state, action: PayloadAction<number>) => {
      state.radiusKm = action.payload;
    },
  },
});

// Location actions.
export const { setLocation, clearLocation, setRadius } = locationSlice.actions;
// Location reducer.
export const locationReducer = locationSlice.reducer;
