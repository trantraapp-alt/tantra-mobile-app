// In-memory cache of category form schemas keyed by categoryId + listingType.
// The same schema drives create, inline-edit and full-edit, so listings that
// share a category fetch it only once.
import { type ListingForm, modulesApi } from '@/features/sell';

const cache = new Map<string, ListingForm>();

// Fetches (and caches) the form schema for a category. Some categories register
// their form under BOTH rather than the requested type, so we fall back.
export async function fetchCategoryForm(
  categoryId: number,
  listingType: string,
): Promise<ListingForm> {
  const key = `${categoryId}:${listingType}`;
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const candidates = listingType === 'BOTH' ? ['BOTH'] : [listingType, 'BOTH'];
  let lastError: unknown = null;

  for (const type of candidates) {
    try {
      const form = await modulesApi.getListingForm(categoryId, type);
      cache.set(key, form);
      cache.set(`${categoryId}:${type}`, form);
      return form;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Failed to load listing form');
}
