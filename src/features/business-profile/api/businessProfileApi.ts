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
  create: (payload: BusinessProfilePayload) =>
    apiClient.post<BusinessProfileWriteResult>(
      endpoints.businessProfiles.create,
      payload,
    ),

  // Returns the current user's own profiles.
  getMyProfiles: (params?: { page?: number; size?: number }) =>
    apiClient.get<BusinessProfilesPage>(endpoints.businessProfiles.mine, {
      params,
    }),

  // Returns a single profile (owner: any status; others: APPROVED + visible only).
  getProfile: (profileId: string) =>
    apiClient.get<BusinessProfile>(endpoints.businessProfiles.detail(profileId)),

  // Admin endpoint: returns a profile for review (ignores visibility/status rules).
  getProfileForReview: (profileId: string) =>
    apiClient.get<BusinessProfile>(
      `/admin/business-profiles/${profileId}`,
    ),

  // Edits a profile (resets status to PENDING).
  update: (profileId: string, payload: BusinessProfilePayload) =>
    apiClient.put<BusinessProfileWriteResult>(
      endpoints.businessProfiles.detail(profileId),
      payload,
    ),

  // Soft-deletes a profile.
  remove: (profileId: string) =>
    apiClient.remove<BusinessProfileWriteResult>(
      endpoints.businessProfiles.detail(profileId),
    ),

  // --- Admin ---

  // Paginated list filtered by status (omit for all).
  getAdminList: (params: {
    status?: string;
    sort?: string;
    page?: number;
    size?: number;
  }) =>
    apiClient.get<BusinessProfilesPage>(endpoints.businessProfiles.adminList, {
      params,
    }),

  // Count tiles for the admin dashboard.
  getStats: () =>
    apiClient.get<AdminBusinessProfileStats>(
      endpoints.businessProfiles.adminStats,
    ),

  // History: all reviewed profiles (APPROVED + REJECTED + BLOCKED).
  getHistory: (params?: { page?: number; size?: number }) =>
    apiClient.get<BusinessProfilesPage>(
      endpoints.businessProfiles.adminHistory,
      { params },
    ),

  // Approves a profile (notifies owner; removes from PENDING queue).
  approve: (profileId: string) =>
    apiClient.post<BusinessProfileWriteResult>(
      endpoints.businessProfiles.adminApprove(profileId),
    ),

  // Rejects a profile (fixable — owner can edit and resubmit).
  reject: (profileId: string, reason: string) =>
    apiClient.post<BusinessProfileWriteResult>(
      endpoints.businessProfiles.adminReject(profileId),
      { reason },
    ),

  // Blocks a profile permanently (offensive content — owner cannot resubmit).
  block: (profileId: string, reason: string) =>
    apiClient.post<BusinessProfileWriteResult>(
      endpoints.businessProfiles.adminBlock(profileId),
      { reason },
    ),
};
