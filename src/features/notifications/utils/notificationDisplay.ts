// Display helpers for notifications.
import { localize,type LocalizedText } from '@/features/sell';
import type { PreferredLanguage } from '@/types';

// Resolves a bilingual-or-plain text to the active language.
export function localizedText(
  text: LocalizedText | string | null | undefined,
  language: PreferredLanguage,
): string {
  if (!text) {
    return '';
  }
  return typeof text === 'string' ? text : localize(text, language);
}
