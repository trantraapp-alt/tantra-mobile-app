// Returns a translate function `t` bound to the active app language, plus the
// language itself. Re-renders consumers whenever the language changes.
import { useCallback } from 'react';

import { type TranslationKey, translations } from '@/i18n';
import { useAppSelector } from '@/store/hooks';
import { selectAppLanguage } from '@/store/selectors';

// Values interpolated into a translated string, keyed by placeholder name.
type TranslationVars = Record<string, string | number>;

// Provides the active-language translate function.
export function useTranslation() {
  const language = useAppSelector(selectAppLanguage);
  const locale = language === 'HI' ? 'hi' : 'en';

  // Translates a key, falling back to English, then the key, and fills vars.
  const t = useCallback(
    (key: TranslationKey, vars?: TranslationVars): string => {
      let text = translations[locale][key] ?? translations.en[key] ?? key;
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.replace(`{${name}}`, String(value));
        }
      }
      return text;
    },
    [locale],
  );

  return { t, language };
}
