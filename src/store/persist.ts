// redux-persist configuration controlling which slices survive app restarts.
import {
  createMigrate,
  type MigrationManifest,
  type PersistConfig,
  type PersistedState,
  persistReducer,
} from 'redux-persist';

import { storageKeys } from '@/constants';
import { persistStorage } from '@/lib';

import { rootReducer, type RootReducerState } from './rootReducer';

// Schema migrations applied to previously persisted state on rehydration.
const migrations: MigrationManifest = {
  // v2: the auth slice is no longer persisted (it is restored from the profile
  // API on launch). Strip any legacy persisted auth so its old shape — which
  // predates the per-operation loading state — can never rehydrate.
  2: (state) => {
    if (!state) {
      return state;
    }
    const { auth: _auth, ...rest } = state as Record<string, unknown>;
    return rest as unknown as PersistedState;
  },
};

// Persistence configuration whitelisting only durable, non-sensitive slices.
// Auth is intentionally excluded: the JWT lives in secure storage and the user
// profile is re-fetched from the backend during bootstrap on every launch.
const persistConfig: PersistConfig<RootReducerState> = {
  key: storageKeys.persistRoot,
  version: 2,
  storage: persistStorage,
  whitelist: ['cart', 'wishlist', 'ui'],
  migrate: createMigrate(migrations),
};

// Root reducer wrapped with redux-persist for automatic rehydration.
export const persistedReducer = persistReducer(persistConfig, rootReducer);
