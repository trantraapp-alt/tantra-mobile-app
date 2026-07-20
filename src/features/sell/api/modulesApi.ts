// Repository layer: raw marketplace modules/categories API calls.
import { endpoints } from '@/config';
import { apiClient } from '@/lib';
import type { MarketplaceModule, ModuleCategory } from '@/types';

import type { ListingForm } from '../forms/listingForm.types';
import type { CreateListingPayload } from '../forms/listingPayload';

// Fetches all active marketplace modules.
function getModules(): Promise<MarketplaceModule[]> {
  return apiClient.get<MarketplaceModule[]>(endpoints.masters.modules, {
    params: { onlyActive: true },
  });
}

// Fetches active categories for a given module.
function getModuleCategories(moduleId: number): Promise<ModuleCategory[]> {
  return apiClient.get<ModuleCategory[]>(
    endpoints.masters.moduleCategories(moduleId),
    { params: { onlyActive: true } },
  );
}

// Fetches the server-driven listing form schema for a category.
function getListingForm(
  categoryId: number,
  listingType: string,
): Promise<ListingForm> {
  return apiClient.get<ListingForm>(endpoints.masters.categoryForm(categoryId), {
    params: { listingType },
  });
}

// Creates a new listing from the collected form values.
function createListing(payload: CreateListingPayload): Promise<unknown> {
  return apiClient.post<unknown, CreateListingPayload>(
    endpoints.listings.create,
    payload,
  );
}

// Marketplace masters repository.
export const modulesApi = {
  getModules,
  getModuleCategories,
  getListingForm,
  createListing,
} as const;
