// Resolves a server auth message (plain or bilingual) to the active language.
import type { AuthMessage, PreferredLanguage } from '@/types';

// Returns the message text for the active language, or '' when absent.
export function resolveAuthMessage(
  message: AuthMessage | undefined,
  language: PreferredLanguage,
): string {
  if (!message) {
    return '';
  }
  if (typeof message === 'string') {
    return message;
  }
  const preferred = language === 'HI' ? message.hi : message.en;
  return preferred ?? message.en ?? message.hi ?? '';
}
