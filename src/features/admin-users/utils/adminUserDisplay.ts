// Display helpers for the admin User Control list — tone mapping for the
// account-status, subscription and business-profile badges, plus a display
// name.
import type { BadgeTone } from '@/components/ui';

import type {
  AdminUserStatus,
  AdminUserSummary,
  BusinessProfileBadge,
  SubscriptionBadge,
} from '../types/adminUser.types';

export function userStatusTone(status: AdminUserStatus): 'success' | 'danger' {
  return status === 'BLOCKED' ? 'danger' : 'success';
}

export function subscriptionTone(badge: SubscriptionBadge): BadgeTone {
  switch (badge) {
    case 'PREMIUM':
    case 'ENTERPRISE':
      return 'warning';
    case 'BASIC':
    case 'STANDARD':
      return 'primary';
    case 'FREE':
    default:
      return 'neutral';
  }
}

export function businessProfileTone(badge: BusinessProfileBadge): BadgeTone {
  switch (badge) {
    case 'APPROVED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
      return 'danger';
    case 'NONE':
    default:
      return 'neutral';
  }
}

// "Ravi Kumar" from separate first/last name fields, tolerating a missing
// last name.
export function userDisplayName(user: Pick<AdminUserSummary, 'firstName' | 'lastName'>): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
}
