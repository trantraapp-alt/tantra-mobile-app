// Filter-state helpers shared by the list screens.
import type { ListingFilters } from '../types';

// True when any narrowing filter is set (ignores `sort`, which is not a
// narrowing filter). Lets a screen browse with filters even without a text query.
export function hasActiveFilters(filters: ListingFilters): boolean {
  return Boolean(
    filters.moduleId != null ||
      filters.listingType ||
      (filters.minPrice != null && !Number.isNaN(filters.minPrice)) ||
      (filters.maxPrice != null && !Number.isNaN(filters.maxPrice)) ||
      filters.district?.trim() ||
      filters.state?.trim() ||
      (filters.radius != null && !Number.isNaN(filters.radius)) ||
      (filters.sellerType && filters.sellerType !== 'ALL') ||
      (filters.postedWithin && filters.postedWithin !== 'ALL'),
  );
}
