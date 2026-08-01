// API repository for the Business Profile feature.
// All calls go through apiClient which handles auth and envelope unwrapping.
import { endpoints } from '@/config/api.config';
import type { ListingForm } from '@/features/sell/forms/listingForm.types';
import { apiClient } from '@/lib/api/apiClient';

import type {
  AdminBusinessProfileStats,
  BusinessProfile,
  BusinessProfilesPage,
  BusinessProfileWriteResult,
  ProfileTypeOption,
} from '../types/businessProfile.types';
import { normalizeBusinessProfile, normalizeProfileStatus } from '../utils/profileStatus';

// Normalizes every profile's status in a list response so callers never see
// an inconsistent-casing or admin-only `verificationStatus` field diverge from
// `status`. Some endpoints (at least `/business-profiles/mine`) return a bare
// array instead of the documented `{ content, page, last }` envelope —
// preserve whichever shape actually comes back rather than assume `.content`
// exists, since the calling hooks each do their own shape-adaptive parsing.
function normalizeProfilesResponse<T extends BusinessProfilesPage | BusinessProfile[]>(
  res: T,
): T {
  if (Array.isArray(res)) {
    return res.map(normalizeBusinessProfile) as T;
  }
  return {
    ...res,
    content: (res.content ?? []).map(normalizeBusinessProfile),
  } as T;
}

// Create / update payload shape.
export interface BusinessProfilePayload {
  profileType: string;
  businessName: string;
  isVisible: boolean;
  address: Record<string, unknown>;
  attributes: Record<string, unknown>;
  [key: string]: unknown;
}

export const businessProfileApi = {
  // --- Owner CRUD ---

  // Fetches the server-driven form schema for the given profile type.
  getForm: (profileType?: string) =>
    apiClient.get<ListingForm>(endpoints.businessProfiles.form, {
      params: profileType ? { profileType } : undefined,
    }),

  // Fetches the profile-type option-set items.
  getProfileTypes: () =>
    apiClient.get<ProfileTypeOption[]>(endpoints.businessProfiles.optionTypes),

  // Creates a new business profile (status starts at PENDING).
  create: async (payload: BusinessProfilePayload) => {
    const res = await apiClient.post<BusinessProfileWriteResult>(
      endpoints.businessProfiles.create,
      payload,
    );
    return { ...res, status: normalizeProfileStatus(res.status) };
  },

  // Returns the current user's own profiles. This endpoint sometimes returns
  // a bare array instead of the paginated envelope — the return type reflects
  // that honestly so `normalizeProfilesResponse` and the calling hook both
  // adapt to whichever shape actually arrives instead of assuming one.
  getMyProfiles: async (params?: { page?: number; size?: number }) => {
    const res = await apiClient.get<BusinessProfilesPage | BusinessProfile[]>(
      endpoints.businessProfiles.mine,
      { params },
    );
    return normalizeProfilesResponse(res);
  },

  // Returns a single profile (owner: any status; others: APPROVED + visible only).
  getProfile: async (profileId: string) => {
    const res = await apiClient.get<BusinessProfile>(
      endpoints.businessProfiles.detail(profileId),
    );
    return normalizeBusinessProfile(res);
  },

  // Admin endpoint: returns a profile for review (ignores visibility/status rules).
  getProfileForReview: async (profileId: string) => {
    const res = await apiClient.get<BusinessProfile>(
      `/admin/business-profiles/${profileId}`,
    );
    return normalizeBusinessProfile(res);
  },

  // Edits a profile (resets status to PENDING).
  update: async (profileId: string, payload: BusinessProfilePayload) => {
    const res = await apiClient.put<BusinessProfileWriteResult>(
      endpoints.businessProfiles.detail(profileId),
      payload,
    );
    return { ...res, status: normalizeProfileStatus(res.status) };
  },

  // Soft-deletes a profile.
  remove: (profileId: string) =>
    apiClient.remove<BusinessProfileWriteResult>(
      endpoints.businessProfiles.detail(profileId),
    ),

  // --- Admin ---

  // Paginated list filtered by status (omit for all).
  getAdminList: async (params: {
    status?: string;
    sort?: string;
    page?: number;
    size?: number;
  }) => {
    const res = await apiClient.get<BusinessProfilesPage | BusinessProfile[]>(
      endpoints.businessProfiles.adminList,
      { params },
    );
    return normalizeProfilesResponse(res);
  },

  // Count tiles for the admin dashboard.
  getStats: () =>
    apiClient.get<AdminBusinessProfileStats>(
      endpoints.businessProfiles.adminStats,
    ),

  // History: all reviewed profiles (APPROVED + REJECTED + BLOCKED).
  getHistory: async (params?: { page?: number; size?: number }) => {
    const res = await apiClient.get<BusinessProfilesPage | BusinessProfile[]>(
      endpoints.businessProfiles.adminHistory,
      { params },
    );
    return normalizeProfilesResponse(res);
  },

  // Approves a profile (notifies owner; removes from PENDING queue).
  approve: async (profileId: string) => {
    const res = await apiClient.post<BusinessProfileWriteResult>(
      endpoints.businessProfiles.adminApprove(profileId),
    );
    return { ...res, status: normalizeProfileStatus(res.status) };
  },

  // Rejects a profile (fixable — owner can edit and resubmit).
  reject: async (profileId: string, reason: string) => {
    const res = await apiClient.post<BusinessProfileWriteResult>(
      endpoints.businessProfiles.adminReject(profileId),
      { reason },
    );
    return { ...res, status: normalizeProfileStatus(res.status) };
  },

  // Blocks a profile permanently (offensive content — owner cannot resubmit).
  block: async (profileId: string, reason: string) => {
    const res = await apiClient.post<BusinessProfileWriteResult>(
      endpoints.businessProfiles.adminBlock(profileId),
      { reason },
    );
    return { ...res, status: normalizeProfileStatus(res.status) };
  },
};
