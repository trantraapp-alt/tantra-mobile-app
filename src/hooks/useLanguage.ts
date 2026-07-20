// Reads and updates the active app language, keeping the API locale in sync.
import { useCallback } from 'react';

import { localeStore } from '@/lib';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAppLanguage } from '@/store/selectors';
import { setLanguage as setLanguageAction } from '@/store/slices';
import type { PreferredLanguage } from '@/types';

// Provides the current language plus setter/toggle helpers.
export function useLanguage() {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectAppLanguage);

  // Sets the app language and updates the API `lang` parameter.
  const setLanguage = useCallback(
    (next: PreferredLanguage) => {
      dispatch(setLanguageAction(next));
      localeStore.setLanguage(next);
    },
    [dispatch],
  );

  // Toggles between English and Hindi.
  const toggle = useCallback(() => {
    setLanguage(language === 'EN' ? 'HI' : 'EN');
  }, [setLanguage, language]);

  return { language, setLanguage, toggle };
}
