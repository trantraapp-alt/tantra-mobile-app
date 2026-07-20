// Keeps the API locale (sent as the `lang` query param) in sync with the
// persisted app language on launch and whenever it changes.
import { useEffect } from 'react';

import { localeStore } from '@/lib';
import { useAppSelector } from '@/store/hooks';
import { selectAppLanguage } from '@/store/selectors';

// Renders nothing; only mirrors the app language into the locale store.
export function LocaleSync() {
  const language = useAppSelector(selectAppLanguage);

  useEffect(() => {
    localeStore.setLanguage(language);
  }, [language]);

  return null;
}
