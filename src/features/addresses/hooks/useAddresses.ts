// Loads the user's saved addresses and exposes local mutators so set-default and
// delete update the on-screen list instantly.
import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/lib';

import { addressesApi } from '../api';
import type { SavedAddress } from '../types';

// Maximum saved addresses per user (backend rejects the 11th).
const MAX_ADDRESSES = 10;

// Manages the saved-address collection.
export function useAddresses() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const list = await addressesApi.list();
      setAddresses(Array.isArray(list) ? list : []);
      setStatus('success');
    } catch (error) {
      logger.warn('[Addresses] Failed to load addresses', error);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Removes an address from the list after a successful delete.
  const removeLocal = useCallback((addressId: string) => {
    setAddresses((prev) => prev.filter((item) => item.addressId !== addressId));
  }, []);

  return {
    addresses,
    isLoading: status === 'loading',
    isError: status === 'error',
    isEmpty: status === 'success' && addresses.length === 0,
    atLimit: addresses.length >= MAX_ADDRESSES,
    refresh: load,
    removeLocal,
  };
}
