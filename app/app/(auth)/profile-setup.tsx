import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { NuvexaButton, Spacing, TerminalLabel, Typography } from "@/designSystem";
import { supabase } from "@/core/supabase/client";
import { createMyProfile, fetchMyProfile } from "@/core/supabase/queries";
import { useAuth } from "@/features/auth/AuthProvider";
import { useTheme } from "@/themes/ThemeProvider";
import { ThemeOverlay } from "@/themes/ThemeOverlay";

export default function ProfileSetup() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [focused, setFocused] = useState<null | "name" | "user" | "phone">(null);
  const [loading, setLoading] = useState(false);

  // Prefill from Google metadata + check if profile already exists
  useEffect(() => {
    if (!user) return;
    const meta = (user.user_metadata ?? {}) as Record<string, string>;
    const fullName = meta.full_name || meta.name || "";
    setDisplayName((d) => d || fullName);

    // Username — derive a sane suggestion from email
    const email = user.email ?? "";
    const handle = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "") ?? "";
    setUsername((u) => u || handle);

    setPhone((p) => p || user.phone || "");

    // If profile already exists, skip setup — go straight to theme picker
    fetchMyProfile(user.id)
      .then((p) => {
        if (p) router.replace("/(auth)/theme");
      })
      .catch(() => undefined);
  }, [user]);

  const submit = async () => {
    if (!user) return;
    const name = displayName.trim();
    const handle = username.trim().toLowerCase();

    if (name.length < 2) {
      return Alert.alert("Display name", "Enter at least 2 characters.");
    }
    if (handle.length < 3 || handle.length > 30 || !/^[a-z0-9_]+$/.test(handle)) {
      return Alert.alert(
        "Username",
        "3-30 chars, lowercase letters, numbers, or underscores only.",
      );
    }

    setLoading(true);
    try {
      await createMyProfile({ id: user.id, username: handle, display_name: name });

      // Optional: store phone on auth.users (built-in field — no schema change)
      if (phone.trim()) {
        await supabase.auth.updateUser({ phone: phone.trim() }).catch(() => undefined);
      }

      router.replace("/(auth)/theme");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("duplicate") || msg.includes("unique")) {
        Alert.alert("Username taken", "Pick a different one.");
      } else {
        Alert.alert("Couldn't save", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <ThemeOverlay />
      <SafeAreaView style={styles.safe}>
        <View style={styles.body}>
          <TerminalLabel>SETUP · ONE_LAST_THING</TerminalLabel>
          <Text
            style={{
              color: theme.text,
              fontSize: 30,
              fontWeight: theme.displayWeight,
              letterSpacing: -0.5,
              marginTop: Spacing.sm,
              textTransform: theme.uppercase ? "uppercase" : "none",
              fontStyle: theme.italicHeadlines ? "italic" : "normal",
            }}
          >
            Who are you?
          </Text>
          <Text style={[Typography.body, { color: theme.textSubtle, marginTop: Spacing.xs }]}>
            This shows up on your Voices, certificates, and profile.
          </Text>

          <Field
            label="$ DISPLAY_NAME"
            placeholder="Piyush Jangir"
            value={displayName}
            onChangeText={setDisplayName}
            focused={focused === "name"}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
          />

          <Field
            label="$ USERNAME"
            placeholder="piyush_j"
            value={username}
            onChangeText={(v) => setUsername(v.toLowerCase().replace(/\s/g, ""))}
            focused={focused === "user"}
            onFocus={() => setFocused("user")}
            onBlur={() => setFocused(null)}
            autoCapitalize="none"
            hint="3-30 chars · a-z, 0-9, _"
          />

          <Field
            label="$ PHONE (optional)"
            placeholder="+91 98765 43210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            focused={focused === "phone"}
            onFocus={() => setFocused("phone")}
            onBlur={() => setFocused(null)}
            hint="for reward payouts · verified later"
          />
        </View>

        <View style={styles.actions}>
          <NuvexaButton label="Continue" onPress={submit} loading={loading} />
          <Pressable
            onPress={() => router.replace("/(auth)/theme")}
            style={styles.skipBtn}
          >
            <Text style={[Typography.caption, { color: theme.textMuted, textAlign: "center" }]}>
              Skip for now — you can fill this in Profile later.
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  focused,
  onFocus,
  onBlur,
  keyboardType,
  autoCapitalize,
  hint,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  keyboardType?: "default" | "phone-pad" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words";
  hint?: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[Typography.terminal, { color: theme.textMuted, fontSize: 10, marginBottom: 6 }]}>
        {label}
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
          focused && {
            borderColor: theme.primary,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={autoCapitalize ?? "sentences"}
        autoCorrect={false}
      />
      {hint ? (
        <Text style={[Typography.caption, { color: theme.textMuted, marginTop: 4, fontSize: 11 }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  body: { flex: 1 },
  field: { marginTop: Spacing.lg },
  input: { height: 52, paddingHorizontal: Spacing.lg, fontSize: 16 },
  actions: { paddingBottom: Spacing.xl },
  skipBtn: { paddingVertical: Spacing.md },
});
