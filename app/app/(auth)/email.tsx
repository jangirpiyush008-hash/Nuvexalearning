import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { NuvexaButton, Spacing, TerminalLabel, Typography } from "@/designSystem";
import { supabase, supabaseConfigured } from "@/core/supabase/client";
import { DEMO_EMAIL, DEMO_PASSWORD, useAuth } from "@/features/auth/AuthProvider";
import { useTheme } from "@/themes/ThemeProvider";
import { ThemeOverlay } from "@/themes/ThemeOverlay";

type Mode = "signin" | "signup";

export default function EmailAuth() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<null | "email" | "password">(null);
  const { signInDemo } = useAuth();

  const submit = async () => {
    if (!email || !password) return Alert.alert("Missing fields", "Enter both email and password");
    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      // Demo first-run also routes through theme picker
      router.push("/(auth)/theme");
      setTimeout(() => signInDemo(), 50);
      return;
    }
    if (!supabaseConfigured) {
      Alert.alert("Demo mode only", `Supabase isn't configured. Use the demo creds:\n\n${DEMO_EMAIL}\n${DEMO_PASSWORD}`);
      return;
    }
    setLoading(true);
    try {
      const fn = mode === "signin" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
      const { error } = await fn({ email, password });
      if (error) throw error;
      if (mode === "signup") {
        // First-run users pick a theme before landing in the app
        Alert.alert("Check your inbox", "We sent a confirmation link.", [
          { text: "OK", onPress: () => router.push("/(auth)/theme") },
        ]);
      }
      // sign-in goes straight to tabs via RootGate
    } catch (e: unknown) {
      Alert.alert("Failed", e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <ThemeOverlay />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={[Typography.terminal, { color: theme.textSubtle, fontSize: 12 }]}>← back</Text>
          </Pressable>
        </View>

        <View style={styles.body}>
          <TerminalLabel>{mode === "signin" ? "SIGN_IN" : "SIGN_UP"}</TerminalLabel>

          <Text
            style={{
              color: theme.text,
              fontSize: 28,
              fontWeight: theme.displayWeight,
              letterSpacing: -0.5,
              marginTop: Spacing.sm,
              textTransform: theme.uppercase ? "uppercase" : "none",
              fontStyle: theme.italicHeadlines ? "italic" : "normal",
            }}
          >
            {mode === "signin" ? "Welcome back." : "Create your account."}
          </Text>
          <Text style={[Typography.body, { color: theme.textSubtle, marginTop: Spacing.xs }]}>
            {mode === "signin" ? "Pick up where you left off." : "Start your first 60-second trial."}
          </Text>

          {/* Toggle pill */}
          <View
            style={[
              styles.toggle,
              {
                backgroundColor: theme.surfaceCard,
                borderColor: theme.border,
                borderWidth: theme.effects.pixelGrid ? 2 : 1,
                borderRadius: theme.btnRadius === 0 ? 0 : 999,
              },
            ]}
          >
            {(["signin", "signup"] as const).map((m) => {
              const active = m === mode;
              return (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  style={[
                    styles.toggleBtn,
                    {
                      borderRadius: theme.btnRadius === 0 ? 0 : 999,
                    },
                    active && {
                      backgroundColor: theme.primary,
                      shadowColor: theme.primary,
                      shadowOpacity: 0.4,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 0 },
                    },
                  ]}
                >
                  <Text
                    style={[
                      Typography.titleS,
                      { fontSize: 14, color: active ? theme.onPrimary : theme.textSubtle },
                    ]}
                  >
                    {m === "signin" ? "Sign in" : "Sign up"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={[Typography.terminal, { color: theme.textMuted, marginBottom: 6, fontSize: 10 }]}>
              $ EMAIL
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surfaceCard,
                  color: theme.text,
                  borderColor: theme.border,
                  borderRadius: theme.btnRadius,
                  borderWidth: theme.effects.pixelGrid ? 2 : 1,
                },
                focusedField === "email" && {
                  borderColor: theme.primary,
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                },
              ]}
              placeholder="you@domain.com"
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[Typography.terminal, { color: theme.textMuted, marginBottom: 6, fontSize: 10 }]}>
              $ PASSWORD
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surfaceCard,
                  color: theme.text,
                  borderColor: theme.border,
                  borderRadius: theme.btnRadius,
                  borderWidth: theme.effects.pixelGrid ? 2 : 1,
                },
                focusedField === "password" && {
                  borderColor: theme.primary,
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={theme.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <NuvexaButton
            label={mode === "signin" ? "Sign in" : "Create account"}
            onPress={submit}
            loading={loading}
          />
          <View style={{ height: Spacing.sm }} />
          <NuvexaButton label="Fill demo credentials" variant="ghost" onPress={fillDemo} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.xl },
  headerRow: { paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  body: { flex: 1, marginTop: Spacing.md },
  toggle: { flexDirection: "row", marginTop: Spacing.xl, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  fieldGroup: { marginTop: Spacing.lg },
  input: {
    height: 52,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  actions: { paddingBottom: Spacing.xl },
});
