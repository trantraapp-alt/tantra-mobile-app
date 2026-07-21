// "Remember me" credential store. Persists the sign-in mobile number and
// password in encrypted secure storage (expo-secure-store / Keychain / Keystore)
// so they can pre-fill the login form on the next visit. Cleared when the user
// signs in with the box unchecked.
import { secureStorageKeys } from '@/constants';
import { logger, secureStorage } from '@/lib';

// A remembered sign-in credential pair.
export interface RememberedCredentials {
  // Stored mobile number.
  mobileNumber: string;
  // Stored password.
  password: string;
}

// Persists the credentials securely.
async function save(credentials: RememberedCredentials): Promise<void> {
  try {
    await Promise.all([
      secureStorage.setItem(
        secureStorageKeys.rememberedMobile,
        credentials.mobileNumber,
      ),
      secureStorage.setItem(
        secureStorageKeys.rememberedPassword,
        credentials.password,
      ),
    ]);
  } catch (error) {
    logger.warn('rememberedCredentials.save failed', error);
  }
}

// Loads the remembered credentials, or null when none are stored.
async function load(): Promise<RememberedCredentials | null> {
  const [mobileNumber, password] = await Promise.all([
    secureStorage.getItem(secureStorageKeys.rememberedMobile),
    secureStorage.getItem(secureStorageKeys.rememberedPassword),
  ]);
  if (mobileNumber && password) {
    return { mobileNumber, password };
  }
  return null;
}

// Removes any remembered credentials.
async function clear(): Promise<void> {
  await Promise.all([
    secureStorage.removeItem(secureStorageKeys.rememberedMobile),
    secureStorage.removeItem(secureStorageKeys.rememberedPassword),
  ]);
}

// Remembered credentials facade.
export const rememberedCredentials = { save, load, clear } as const;
