// Fetches a geo option-set (country / state / district) on demand, re-fetching
// when the parent item changes. A request-id guard drops out-of-order responses.
import { useEffect, useRef, useState } from 'react';

import { logger } from '@/lib';

import { optionSetsApi } from '../api';
import type { OptionSetItem } from '../types';

// Loads the items of an option set, optionally scoped to a parent item.
export function useOptionSet(
  setKey: string,
  parentItemId?: number | string | null,
  skip = false,
) {
  const [items, setItems] = useState<OptionSetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    if (skip) {
      setItems([]);
      return;
    }
    const id = requestId.current + 1;
    requestId.current = id;
    setLoading(true);
    optionSetsApi
      .getItems(setKey, parentItemId)
      .then((result) => {
        if (id === requestId.current) {
          setItems(Array.isArray(result) ? result : []);
        }
      })
      .catch((error) => {
        if (id === requestId.current) {
          logger.warn('[Addresses] Option set fetch failed', { setKey, error });
          setItems([]);
        }
      })
      .finally(() => {
        if (id === requestId.current) {
          setLoading(false);
        }
      });
  }, [setKey, parentItemId, skip]);

  return { items, loading };
}
