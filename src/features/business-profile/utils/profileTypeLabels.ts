// Maps profile type keys to user-friendly labels.
// Built from the business_profile_type option set.

import type { PreferredLanguage } from '@/types';

import type { ProfileTypeOption } from '../types/businessProfile.types';

// Create a label map from profile type options.
export function createProfileTypeLabelMap(
  profileTypes: ProfileTypeOption[],
  language: PreferredLanguage,
): Map<string, string> {
  const map = new Map<string, string>();
  profileTypes.forEach((type) => {
    const label = language === 'HI' ? type.label.hi : type.label.en;
    map.set(type.value, label);
  });
  return map;
}

// Get the friendly label for a profile type key.
export function getProfileTypeLabel(
  profileType: string,
  profileTypes: ProfileTypeOption[],
  language: PreferredLanguage,
): string {
  const labelMap = createProfileTypeLabelMap(profileTypes, language);
  return labelMap.get(profileType) || profileType; // Fallback to key if not found
}
