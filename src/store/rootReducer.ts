// Combines all feature slices into the application's root reducer.
import { combineReducers } from '@reduxjs/toolkit';

import {
  authReducer,
  cartReducer,
  locationReducer,
  modulesReducer,
  uiReducer,
  wishlistReducer,
} from './slices';

// Root reducer aggregating every persisted and transient slice.
export const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  ui: uiReducer,
  modules: modulesReducer,
  location: locationReducer,
});

// Inferred state tree produced by the root reducer.
export type RootReducerState = ReturnType<typeof rootReducer>;
