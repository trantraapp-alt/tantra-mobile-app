// Wires the Redux store and redux-persist gate into the component tree.
import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { AppSplash } from '@/components/loaders/AppSplash';
import { persistor, store } from '@/store';

// Provides the Redux store and blocks rendering until state is rehydrated.
export function StoreProvider({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <PersistGate loading={<AppSplash />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
