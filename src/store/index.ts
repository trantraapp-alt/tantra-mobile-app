// Configures the Redux store, persistence and exports typed store primitives.
import { configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';

import { errorLoggingMiddleware } from './middleware';
import { persistedReducer } from './persist';
import { thunkExtra } from './thunkExtra';

// Application Redux store with persistence and custom middleware.
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Inject service dependencies into every thunk's `extra` argument.
      thunk: { extraArgument: thunkExtra },
      serializableCheck: {
        // redux-persist dispatches non-serializable lifecycle actions.
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(errorLoggingMiddleware),
});

// Persistor driving rehydration of the persisted store.
export const persistor = persistStore(store);

// Root state type inferred from the configured store.
export type RootState = ReturnType<typeof store.getState>;

// Dispatch type inferred from the configured store.
export type AppDispatch = typeof store.dispatch;

export * from './hooks';
export { rootReducer } from './rootReducer';
export * from './selectors';
