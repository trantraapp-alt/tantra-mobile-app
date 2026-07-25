// Repository for seeded geo option-sets (country / state / district) used by the
// cascading address dropdowns. Child sets are fetched on demand by parent id.
import { endpoints } from '@/config';
import { apiClient } from '@/lib';

import type { OptionSetItem } from '../types';

// Fetches the items of an option set, optionally filtered to a parent item's
// children (e.g. the states of a country).
function getItems(
  setKey: string,
  parentItemId?: number | string | null,
): Promise<OptionSetItem[]> {
  return apiClient.get<OptionSetItem[]>(endpoints.optionSets.items(setKey), {
    params:
      parentItemId != null && parentItemId !== ''
        ? { parentItemId }
        : undefined,
  });
}

// Option-sets repository.
export const optionSetsApi = { getItems } as const;
