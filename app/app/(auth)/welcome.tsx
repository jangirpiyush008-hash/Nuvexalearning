import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { NeonN, NuvexaButton, Spacing, TerminalLabel, Typography } from "@/designSystem";
import { supabase, supabaseConfigured } from "@/core/supabase/client";
import { useTheme } from "@/themes/ThemeProvider";
import { ThemeOverlay } from "@/themes/ThemeOverlay";

const { width } = Dimensions.get("window");

// Required for the OAuth web-browser to complete the redirect flow.
WebBrowser.maybeCompleteAuthSession();

export default function Welcome() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    if (!supabaseConfigured) {
      Alert.alert("Auth not configured", "Set EXPO_PUBLIC_SUPABASE_URL + ANON_KEY in app/.env.local");
      return;
    }
    setLoading(true);
    try {
      const redirectTo = Linking.createURL("auth/callback");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No OAuth URL returned by Supabase.");

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
        // Skips the "wants to use <domain> to Sign In" iOS prompt.
        // We don't share cookies with Safari, which is the right default for OAuth.
        preferEphemeralSession: true,
      });
      if (result.type !== "success" || !result.url) return;

      // Pull tokens out of the redirect URL and hand to Supabase.
      const url = new URL(result.url);
      const params = new URLSearchParams(url.hash.replace(/^#/, "") || url.search);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        const { error: setErr } = await supabase.auth.setSession({ access_token, refresh_token });
        if (setErr) throw setErr;
        // profile-setup handles "already-set-up" case internally → redirects to theme picker.
        router.push("/(auth)/profile-setup");
      }
    } catch (e: unknown) {
      Alert.alert("Google sign-in failed", e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <ThemeOverlay />

      <View
        style={[
          styles.bleed,
          styles.bleedTopRight,
          { backgroundColor: theme.primary, shadowColor: theme.primary },
        ]}
      />
      <View
        style={[
          styles.bleed,
          styles.bleedBottomLeft,
          { backgroundColor: theme.primary, shadowColor: theme.primary, opacity: 0.04 },
        ]}
      />

      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <NeonN size={88} />
          <Text style={[styles.wordmark, { color: theme.text }]}>
            nuvexa
            <Text style={{ color: theme.textMuted, fontWeight: "500" }}>.studio</Text>
          </Text>

          <View style={styles.terminalRow}>
            <TerminalLabel>WELCOME · {theme.name.toUpperCase()}</TerminalLabel>
          </View>

          <Text style={[styles.headline, { color: theme.text }]}>
            Learn AI from people{"\n"}who{" "}
            <Text
              style={{
                color: theme.primary,
                textShadowColor: theme.primary,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 16,
              }}
            >
              ship it.
            </Text>
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSubtle }]}>
            Trial any course in 60 seconds. Pass the final test, earn ₹10,000 in AI Credits.
          </Text>
        </View>

        <View style={styles.actions}>
          <NuvexaButton
            label={loading ? "Opening Google…" : "Continue with Google"}
            onPress={signInWithGoogle}
            loading={loading}
          />
          <View style={{ height: Spacing.md }} />
          <NuvexaButton
            label="Continue with email"
            variant="secondary"
            onPress={() => router.push("/(auth)/email")}
          />

          <Text
            style={[
              Typography.caption,
              { color: theme.textMuted, textAlign: "center", marginTop: Spacing.md },
            ]}
          >
            By continuing you agree to the Terms · Privacy Policy
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.xl, justifyContent: "space-between" },
  hero: { flex: 1, alignItems: "center", justifyContent: "center" },
  wordmark: {
    marginTop: Spacing.xl,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  terminalRow: { marginTop: Spacing.xl, marginBottom: Spacing.md },
  headline: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 38,
    textAlign: "center",
    marginTop: Spacing.lg,
  },
  subtitle: {
    ...Typography.body,
    textAlign: "center",
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  actions: { paddingBottom: Spacing.xl },
  bleed: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width,
    opacity: 0.06,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 100,
  },
  bleedTopRight: { top: -width * 0.55, right: -width * 0.4 },
  bleedBottomLeft: { bottom: -width * 0.55, left: -width * 0.4 },
});
