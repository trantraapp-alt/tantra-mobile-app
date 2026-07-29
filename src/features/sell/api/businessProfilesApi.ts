// Repository layer for business profiles (e.g. Veterinary / vet_clinic). The
// form endpoint is authenticated — the bearer token is attached by the shared
// request interceptor, so callers just need the user to be signed in.
import { endpoints } from '@/config';
import { apiClient } from '@/lib';

import type { CreateBusinessProfilePayload } from '../forms/businessProfilePayload';
import type { ListingForm, LocalizedText } from '../forms/listingForm.types';

// The metadata form for a business-profile type. Same shape as a listing form
// but without the listing-only `categoryId` / `listingType`.
export type BusinessProfileForm = Omit<
  ListingForm,
  'categoryId' | 'listingType'
>;

// Result of creating a business profile.
export interface BusinessProfileResult {
  // Server id of the created profile.
  profileId: number | string;
  // Lifecycle status — PENDING until an admin approves.
  status: string;
  // Optional reason (e.g. why it is pending / rejected).
  reason?: string | null;
  // Bilingual (or plain) result message to surface to the user.
  message?: LocalizedText | string;
}

// Fetches the server-driven form for a business-profile type (authenticated).
// Viewing the form handles its own 401 (an inline "sign in" message) rather than
// ending the session globally, so merely opening it while signed out is safe.
function getForm(profileType: string): Promise<BusinessProfileForm> {
  const config = { params: { profileType }, skipSessionExpiry: true };
  return apiClient.get<BusinessProfileForm>(
    endpoints.businessProfiles.form,
    config,
  );
}

// Creates a business profile from the collected form values.
function create(
  payload: CreateBusinessProfilePayload,
): Promise<BusinessProfileResult> {
  return apiClient.post<BusinessProfileResult, CreateBusinessProfilePayload>(
    endpoints.businessProfiles.create,
    payload,
  );
}

// Business profiles repository.
export const businessProfilesApi = {
  getForm,
  create,
} as const;
