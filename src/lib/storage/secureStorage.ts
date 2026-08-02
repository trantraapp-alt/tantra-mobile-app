// Thin, typed wrapper around expo-secure-store for sensitive values (tokens).
import * as SecureStore from 'expo-secure-store';

import type { SecureStorageKey } from '@/constants';

import { logger } from '../logger';

// Persists a sensitive value under the given secure key. expo-secure-store only
// accepts strings, so a non-string here (e.g. an `undefined` token from a
// mismatched API response) is caught with a clear, key-named error instead of
// the cryptic "Invalid value provided to SecureStore" thrown deep in the native
// module.
async function setItem(key: SecureStorageKey, value: string): Promise<void> {
  if (typeof value !== 'string') {
    logger.error('secureStorage.setItem: non-string value', {
      key,
      valueType: value === null ? 'null' : typeof value,
    });
    throw new Error(
      `secureStorage.setItem: value for "${key}" must be a string, received ${
        value === null ? 'null' : typeof value
      }`,
    );
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    logger.error('secureStorage.setItem failed', { key, error });
    throw error;
  }
}

// Reads a sensitive value, returning null when absent.
async function getItem(key: SecureStorageKey): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    logger.error('secureStorage.getItem failed', { key, error });
    return null;
  }
}

// Removes a sensitive value.
async function removeItem(key: SecureStorageKey): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    logger.error('secureStorage.removeItem failed', { key, error });
  }
}

// Secure storage facade for tokens and other sensitive data.
export const secureStorage = { setItem, getItem, removeItem } as const;
