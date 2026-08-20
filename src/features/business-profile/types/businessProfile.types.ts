// Types for the Business Profile feature — owner CRUD and admin verification.
import type { LocalizedText } from '@/features/sell/forms/listingForm.types';

// Verification status of a business profile.
export type BusinessProfileStatus =
  'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';

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
  // Submission timestamp — used for the queue's "X days ago" and the
  // dashboard's oldest-first sort. Not always present on leaner projections.
  createdAt?: string;
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

// A single row of the stats dashboard's category breakdown (Section D).
export interface CategoryBreakdownItem {
  profileType: string;
  count: number;
  percentage: number;
}

// Stats returned by /admin/business-profiles/stats.
export interface AdminBusinessProfileStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  blocked: number;
  // Time-to-approval (Section B). avgApprovalDays is null when nothing has
  // been approved yet.
  avgApprovalDays: number | null;
  maxPendingDays: number | null;
  overdueCount: number;
  // Success rate (Section C) — percentage of approved+rejected+blocked that
  // were approved. pending is deliberately excluded from the denominator.
  successRate: number;
  // Category breakdown (Section D). Empty array renders as "No data yet".
  categoryBreakdown: CategoryBreakdownItem[];
  reviewedByMe?: {
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
