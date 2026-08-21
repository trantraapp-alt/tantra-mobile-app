// Loads the (cached) form schemas for a set of categories, so listing cards can
// resolve their stored attribute values into readable, localized names.
import { useEffect, useMemo, useState } from 'react';

import { fetchCategoryForm, type ListingForm } from '@/features/sell';

// Returns form schemas keyed by category id for the given categories.
export function useCategoryForms(categoryIds: number[], listingType: string) {
  const [forms, setForms] = useState<Record<number, ListingForm>>({});

  // Stable primitive dependency for the distinct, sorted id set.
  const key = useMemo(
    () =>
      Array.from(new Set(categoryIds))
        .filter((id) => Number.isFinite(id) && id > 0)
        .sort((a, b) => a - b)
        .join(','),
    [categoryIds],
  );

  useEffect(() => {
    if (key === '') {
      setForms({});
      return;
    }
    let active = true;
    const ids = key.split(',').map(Number);

    void Promise.all(
      ids.map(async (id) => {
        try {
          return [id, await fetchCategoryForm(id, listingType)] as const;
        } catch {
          return null;
        }
      }),
    ).then((entries) => {
      if (!active) {
        return;
      }
      const next: Record<number, ListingForm> = {};
      entries.forEach((entry) => {
        if (entry) {
          next[entry[0]] = entry[1];
        }
      });
      setForms(next);
    });

    return () => {
      active = false;
    };
  }, [key, listingType]);

  return forms;
}
