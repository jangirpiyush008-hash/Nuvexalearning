import "react-native-url-polyfill/auto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SecureStorage } from "../storage/secureStore";

// Placeholder lets the client construct even when env is missing.
// In demo mode the client is never actually called; in real mode any call
// returns a network error caught by the screen's try/catch.
const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-anon-key";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const supabaseConfigured = Boolean(url && anonKey);

if (!supabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] env vars missing. App will use demo data only. " +
      "Copy .env.example → .env.local and set EXPO_PUBLIC_SUPABASE_URL + ANON_KEY for real auth.",
  );
}

const secureStorageAdapter = {
  getItem: (key: string) => SecureStorage.get(key),
  setItem: (key: string, value: string) => SecureStorage.set(key, value),
  removeItem: (key: string) => SecureStorage.remove(key),
};

export const supabase: SupabaseClient = createClient(
  url || PLACEHOLDER_URL,
  anonKey || PLACEHOLDER_KEY,
  {
    auth: {
      storage: secureStorageAdapter,
      autoRefreshToken: supabaseConfigured,
      persistSession: supabaseConfigured,
      detectSessionInUrl: false,
    },
  },
);
