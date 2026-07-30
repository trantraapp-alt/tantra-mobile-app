// Types for the Business Profile feature — owner CRUD and admin verification.
import type { LocalizedText } from '@/features/sell/forms/listingForm.types';

// Verification status of a business profile.
export type BusinessProfileStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';

// A user's business profile record returned from the API.
export interface BusinessProfile {
  profileId: string;
  profileType: string;
  businessName: string;
  isVisible: boolean;
  status: BusinessProfileStatus;
  rejectReason: string | null;
  blockReason: string | null;
  address: Record<string, unknown>;
  attributes: Record<string, unknown>;
  // Admin-set fields (present in admin list / history responses).
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  verificationStatus?: string | null;
}

// Paginated list of business profiles.
export interface BusinessProfilesPage {
  content: BusinessProfile[];
  page: number;
  last: boolean;
  totalElements?: number;
  totalPages?: number;
}

// Response body for create/update/delete operations.
export interface BusinessProfileWriteResult {
  success: boolean;
  profileId: string;
  status: BusinessProfileStatus;
  reason: string | null;
  message: LocalizedText;
}

// Stats returned by /admin/business-profiles/stats.
export interface AdminBusinessProfileStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  blocked: number;
  reviewedByMe: {
    approved: number;
    rejected: number;
    blocked: number;
  };
}

// Option-set item (profile-type picker).
export interface ProfileTypeOption {
  id: string | number;
  value: string;
  label: LocalizedText;
}
