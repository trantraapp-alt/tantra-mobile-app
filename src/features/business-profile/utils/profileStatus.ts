// Single source of truth for reading and presenting a business profile's
// verification status. Some admin endpoints carry the authoritative value in
// `verificationStatus` rather than `status`, and either field can arrive with
// inconsistent casing/whitespace — resolving and normalizing it in one place
// means every screen agrees, instead of each duplicating its own fallback
// chain (a bug magnet: a stray last-else in one of those chains is what made
// an unrecognized/stale status value silently render as "Blocked").
import {
  BadgeCheck,
  Ban,
  Clock,
  type LucideIcon,
  XCircle,
} from 'lucide-react-native';

import type { TranslationKey } from '@/i18n';

import type { BusinessProfile, BusinessProfileStatus } from '../types/businessProfile.types';

const VALID_STATUSES: readonly BusinessProfileStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'BLOCKED',
];

// Normalizes a possibly-inconsistent raw status value (casing, whitespace) to
// one of the four canonical values. An unrecognized value defaults to PENDING
// — never to BLOCKED — since silently claiming a permanent takedown for a
// value we don't understand would be actively misleading.
export function normalizeProfileStatus(
  raw: string | null | undefined,
): BusinessProfileStatus {
  const value = (raw ?? '').trim().toUpperCase();
  return (VALID_STATUSES as readonly string[]).includes(value)
    ? (value as BusinessProfileStatus)
    : 'PENDING';
}

// Resolves a profile's effective status: admin list/history rows carry the
// authoritative value in `verificationStatus`; owner-facing endpoints use
// `status`. Prefer whichever is actually present.
export function resolveProfileStatus(
  profile: Pick<BusinessProfile, 'status' | 'verificationStatus'>,
): BusinessProfileStatus {
  return normalizeProfileStatus(profile.verificationStatus ?? profile.status);
}

// Returns a shallow copy of the profile with `status` set to its resolved,
// normalized value — apply this once at the API boundary so every consumer
// downstream can trust `profile.status` directly.
export function normalizeBusinessProfile(profile: BusinessProfile): BusinessProfile {
  return { ...profile, status: resolveProfileStatus(profile) };
}

// Narrower than BadgeTone (only the tones this feature ever uses) so callers
// can safely index theme.colors[tone] — BadgeTone also allows 'primary' /
// 'neutral', which have no matching ColorScheme key.
export type ProfileStatusTone = 'success' | 'warning' | 'danger';

export function getStatusTone(status: BusinessProfileStatus): ProfileStatusTone {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
    case 'BLOCKED':
      return 'danger';
  }
}

// Tone for the card-style presentations (BusinessProfileCard, the admin
// review list) only: BLOCKED reads amber here, distinct from REJECTED's red,
// so a permanently-blocked profile doesn't look identical to a fixable
// rejection on the one card an owner or admin keeps coming back to.
// Everywhere else (reason notices, action buttons, the detail view) keeps
// getStatusTone's red for BLOCKED.
export function getCardTone(status: BusinessProfileStatus): ProfileStatusTone {
  return status === 'BLOCKED' ? 'warning' : getStatusTone(status);
}

export function getStatusLabelKey(status: BusinessProfileStatus): TranslationKey {
  switch (status) {
    case 'APPROVED':
      return 'businessProfile.status.approved';
    case 'PENDING':
      return 'businessProfile.status.pending';
    case 'REJECTED':
      return 'businessProfile.status.rejected';
    case 'BLOCKED':
      return 'businessProfile.status.blocked';
  }
}

export function getStatusIcon(status: BusinessProfileStatus): LucideIcon {
  switch (status) {
    case 'APPROVED':
      return BadgeCheck;
    case 'PENDING':
      return Clock;
    case 'REJECTED':
      return XCircle;
    case 'BLOCKED':
      return Ban;
  }
}
