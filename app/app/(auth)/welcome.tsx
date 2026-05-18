import React from "react";
import { View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { NeonN, NuvexaButton, Spacing, TerminalLabel, Typography } from "@/designSystem";
import { useAuth, DEMO_EMAIL, DEMO_PASSWORD } from "@/features/auth/AuthProvider";
import { useTheme } from "@/themes/ThemeProvider";
import { ThemeOverlay } from "@/themes/ThemeOverlay";

const { width } = Dimensions.get("window");

export default function Welcome() {
  const router = useRouter();
  const { signInDemo } = useAuth();
  const { theme } = useTheme();

  // Demo first-run → theme picker. signInDemo sets the session immediately,
  // so we route forward before the auth gate redirects to /(tabs)/home.
  const onDemo = () => {
    router.push("/(auth)/theme");
    setTimeout(() => signInDemo(), 50);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <ThemeOverlay />
      {/* corner neon bleeds */}
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
            nuvexa<Text style={{ color: theme.textMuted, fontWeight: "500" }}>.studio</Text>
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
          <NuvexaButton label="Get started" onPress={() => router.push("/(auth)/email")} />
          <View style={{ height: Spacing.md }} />
          <NuvexaButton label="Try demo · no signup" variant="secondary" onPress={onDemo} />

          <View
            style={[
              styles.demoStrip,
              {
                borderColor: theme.border,
                backgroundColor: theme.surfaceCard,
                borderRadius: theme.btnRadius,
              },
            ]}
          >
            <Text
              style={[
                Typography.terminal,
                {
                  color: theme.primary,
                  textShadowColor: theme.primary,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 6,
                },
              ]}
            >
              $ DEMO_CREDS
            </Text>
            <Text style={[Typography.mono, { color: theme.textSubtle, fontSize: 11 }]}>
              {DEMO_EMAIL} · {DEMO_PASSWORD}
            </Text>
          </View>

          <Text style={[Typography.caption, { color: theme.textMuted, textAlign: "center", marginTop: Spacing.md }]}>
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
  themePill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  themeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  demoStrip: {
    marginTop: Spacing.lg,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
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
