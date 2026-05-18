import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import { NeonN, NuvexaButton, Spacing, TerminalLabel, Typography } from "@/designSystem";
import { supabase, supabaseConfigured } from "@/core/supabase/client";
import { useTheme } from "@/themes/ThemeProvider";
import { ThemeOverlay } from "@/themes/ThemeOverlay";

const { width } = Dimensions.get("window");

// iOS client ID from Google Cloud Console → OAuth 2.0 Client IDs → iOS.
// Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in app/.env.local.
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
// Web client ID — required to mint an idToken that Supabase can verify.
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export default function Welcome() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!WEB_CLIENT_ID) return;
    GoogleSignin.configure({
      iosClientId: IOS_CLIENT_ID,
      webClientId: WEB_CLIENT_ID,
      scopes: ["profile", "email"],
    });
  }, []);

  const signInWithGoogle = async () => {
    if (!supabaseConfigured) {
      Alert.alert("Auth not configured", "Set EXPO_PUBLIC_SUPABASE_URL + ANON_KEY in app/.env.local");
      return;
    }
    if (!WEB_CLIENT_ID) {
      // Fall through to a demo session so the build still runs in Expo Go.
      if (Constants.appOwnership === "expo") {
        router.push("/(auth)/profile-setup");
        return;
      }
      Alert.alert(
        "Google not configured",
        "Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID and EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in app/.env.local, then drop GoogleService-Info.plist into ios/.",
      );
      return;
    }
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Raw nonce → SHA256 hash. Google embeds the hash in the id_token's
      // nonce claim; Supabase verifies hash(rawNonce) === id_token.nonce.
      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );

      const userInfo: any = await GoogleSignin.signIn({ nonce: hashedNonce } as any);
      const idToken =
        userInfo?.idToken ??
        userInfo?.data?.idToken ??
        (await GoogleSignin.getTokens()).idToken;
      if (!idToken) throw new Error("No idToken returned from Google.");

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
        nonce: rawNonce,
      });
      if (error) throw error;

      // profile-setup handles "already-set-up" case internally → redirects to theme picker.
      router.push("/(auth)/profile-setup");
    } catch (e: any) {
      if (e?.code === statusCodes.SIGN_IN_CANCELLED) return;
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
            <Text style={{ color: theme.textMuted, fontWeight: "500" }}>.learning</Text>
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
