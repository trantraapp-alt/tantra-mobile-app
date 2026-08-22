// Types for the admin User Control feature — list/detail/actions on app users.
// Action payloads (block/unblock, subscription, listings) get added once
// those screens are built.

// Account status.
export type AdminUserStatus = 'ACTIVE' | 'BLOCKED';

// Active subscription tier, or FREE when the user has none.
export type SubscriptionBadge = 'FREE' | 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';

// Business-profile verification state, or NONE when the user never created one.
export type BusinessProfileBadge = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

// One row of GET /admin/users.
export interface AdminUserSummary {
  userId: string;
  firstName: string;
  lastName: string | null;
  mobileNumber: string;
  appUsageRole: string;
  status: AdminUserStatus;
  joinedAt: string;
  lastLoginAt: string | null;
  subscriptionBadge: SubscriptionBadge;
  businessProfileBadge: BusinessProfileBadge;
}

// Spring-style page of users.
export interface AdminUsersPage {
  content: AdminUserSummary[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Query params accepted by GET /admin/users — all optional.
export interface AdminUsersListParams {
  search?: string;
  userId?: string;
  isBlocked?: boolean;
  hasSub?: boolean;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// A user's listing activity, as returned inside the detail response.
export interface AdminUserActivity {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  lastListingAt: string | null;
}

// A user's current/most-recent subscription, or null if they never had one.
export interface AdminUserSubscription {
  subscriptionId: string;
  planName: string;
  planKey: string;
  startedAt: string;
  expiresAt: string;
  status: string;
  grantedBy: string | null;
}

// A user's business profile summary, or null if they never created one.
export interface AdminUserBusinessProfileSummary {
  profileId: string;
  businessName: string;
  profileType: string;
  verificationStatus: string;
}

// One of a user's saved addresses.
export interface AdminUserAddress {
  addressId: string;
  label: string | null;
  fullAddress: string;
  district: string | null;
  state: string | null;
  isDefault: boolean;
}

// GET /admin/users/{userId} — the full detail behind one list row.
export interface AdminUserDetail {
  userId: string;
  firstName: string;
  lastName: string | null;
  mobileNumber: string;
  preferredLanguage: string;
  appUsageRole: string;
  status: AdminUserStatus;
  blockedReason: string | null;
  blockedAt: string | null;
  joinedAt: string;
  lastLoginAt: string | null;
  activity: AdminUserActivity;
  subscription: AdminUserSubscription | null;
  businessProfile: AdminUserBusinessProfileSummary | null;
  addresses: AdminUserAddress[];
}
