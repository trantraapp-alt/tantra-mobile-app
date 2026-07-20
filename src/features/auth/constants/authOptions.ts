// Selectable options for auth forms (usage role and preferred language).
import type { AppUsageRole, PreferredLanguage, SelectOption } from '@/types';

// Options for the app usage role selector.
export const roleOptions: SelectOption<AppUsageRole>[] = [
  { label: 'Buyer', value: 'BUYER' },
  { label: 'Seller', value: 'SELLER' },
  { label: 'Both', value: 'BOTH' },
];

// Options for the preferred language selector.
export const languageOptions: SelectOption<PreferredLanguage>[] = [
  { label: 'English', value: 'EN' },
  { label: 'हिन्दी', value: 'HI' },
];
