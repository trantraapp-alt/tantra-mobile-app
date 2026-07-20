// Typed AsyncStorage wrapper for non-sensitive persisted data.
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StorageKey } from '@/constants';

import { logger } from '../logger';

// Persists a JSON-serializable value under the given key.
async function setObject<TValue>(key: StorageKey, value: TValue): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logger.error('appStorage.setObject failed', { key, error });
  }
}

// Reads and parses a stored value, returning null when absent or invalid.
async function getObject<TValue>(key: StorageKey): Promise<TValue | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as TValue) : null;
  } catch (error) {
    logger.error('appStorage.getObject failed', { key, error });
    return null;
  }
}

// Removes a stored value.
async function removeItem(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    logger.error('appStorage.removeItem failed', { key, error });
  }
}

// Non-sensitive storage facade backed by AsyncStorage.
export const appStorage = { setObject, getObject, removeItem } as const;

// AsyncStorage engine reused by redux-persist.
export const persistStorage = AsyncStorage;
