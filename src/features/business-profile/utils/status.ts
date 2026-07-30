// Resolves the backend verification status to a known, safe status value.
//
// The list endpoint can send the status in a different case, under the alternate
// `verificationStatus` field, or as an alias (e.g. VERIFIED / UNDER_REVIEW). A
// naive `switch` that defaults to BLOCKED would then mislabel every profile as
// blocked, so we normalize here and fall back to PENDING — never BLOCKED — for
// anything unrecognized.
import type {
  BusinessProfile,
  BusinessProfileStatus,
} from '../types/businessProfile.types';

// Normalizes a profile's status (case-insensitive, with `verificationStatus`
// fallback and common aliases) to one of the four known statuses.
export function resolveProfileStatus(
  profile: Pick<BusinessProfile, 'status' | 'verificationStatus'>,
): BusinessProfileStatus {
  const raw = String(profile.status ?? profile.verificationStatus ?? '')
    .trim()
    .toUpperCase();
  switch (raw) {
    case 'APPROVED':
    case 'VERIFIED':
      return 'APPROVED';
    case 'REJECTED':
      return 'REJECTED';
    case 'BLOCKED':
      return 'BLOCKED';
    case 'PENDING':
    case 'UNDER_REVIEW':
    case 'IN_REVIEW':
    case 'SUBMITTED':
    default:
      return 'PENDING';
  }
}
