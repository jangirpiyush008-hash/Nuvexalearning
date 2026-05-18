// Keychain-backed token storage (iOS) / EncryptedSharedPreferences (Android).
// Never use AsyncStorage for tokens.
import * as SecureStore from "expo-secure-store";

export const SecureStorage = {
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  },
  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};
