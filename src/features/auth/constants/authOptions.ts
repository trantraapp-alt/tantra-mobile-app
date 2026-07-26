// Selectable options for auth forms (preferred language).
import type { PreferredLanguage, SelectOption } from '@/types';

// Options for the preferred language selector.
export const languageOptions: SelectOption<PreferredLanguage>[] = [
  { label: 'English', value: 'EN' },
  { label: 'हिन्दी', value: 'HI' },
];
