// Repository for the backend-driven filter form (public — no JWT needed).
import { endpoints } from '@/config';
import { apiClient } from '@/lib';

import type { FilterForm } from '../types';

// Fetches the filter form — the global form, or a category's form when an id is
// passed. Definitions rarely change, so callers should cache the result.
export function getFilterForm(categoryId?: number): Promise<FilterForm> {
  return apiClient.get<FilterForm>(endpoints.filters.form, {
    params: categoryId != null ? { categoryId } : undefined,
  });
}
