import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GradientChip,
  NuvexaButton,
  NuvexaCard,
  Spacing,
  TerminalLabel,
  Typography,
} from "@/designSystem";
import { useAuth } from "@/features/auth/AuthProvider";
import { useTheme } from "@/themes/ThemeProvider";
import { ThemeOverlay } from "@/themes/ThemeOverlay";
import { THEME_ICONS } from "@/themes/themeIcons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

export default function Profile() {
  const { user, signOut, isDemo } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const display = user?.email ?? "—";
  const handle = (user?.email ?? "demo@nuvexa").split("@")[0];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.surface }]}>
      <ThemeOverlay />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TerminalLabel>PROFILE · ME</TerminalLabel>

        <View style={styles.identityRow}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.primary,
                borderWidth: theme.effects.pixelGrid ? 2 : 1,
              },
            ]}
          >
            <Text style={{ color: theme.text, fontSize: 28, fontWeight: "700" }}>
              {display[0]?.toUpperCase()}
            </Text>
          </View>
          <View style={{ marginLeft: Spacing.md, flex: 1 }}>
            <Text
              style={{
                ...Typography.titleM,
                color: theme.text,
                fontWeight: theme.displayWeight,
                textTransform: theme.uppercase ? "uppercase" : "none",
                fontStyle: theme.italicHeadlines ? "italic" : "normal",
              }}
            >
              @{handle}
            </Text>
            <Text style={[Typography.caption, { color: theme.textSubtle, marginTop: 2 }]}>
              {display}
            </Text>
            <View style={{ flexDirection: "row", marginTop: Spacing.sm, gap: 6 }}>
              {isDemo ? <GradientChip label="DEMO_MODE" variant="outline" /> : null}
              <GradientChip label="LEARNER" variant="outline" />
            </View>
          </View>
        </View>

        <View style={{ marginTop: Spacing.xl }}>
          <TerminalLabel color={theme.textMuted}>STATS</TerminalLabel>
          <NuvexaCard style={{ marginTop: Spacing.sm }}>
            <View style={styles.statRow}>
              <Stat label="COURSES" value={isDemo ? "3" : "0"} />
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <Stat label="VOICES" value={isDemo ? "1" : "0"} />
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <Stat label="CREDITS" value={isDemo ? "₹200" : "₹0"} accent />
            </View>
          </NuvexaCard>
        </View>

        <View style={{ marginTop: Spacing.xl }}>
          <TerminalLabel color={theme.textMuted}>APPEARANCE</TerminalLabel>
          <NuvexaCard style={{ marginTop: Spacing.sm }}>
            <Pressable
              style={styles.themeRow}
              onPress={() => router.push("/(auth)/theme")}
            >
              <Image
                source={THEME_ICONS[theme.id]}
                style={[
                  styles.themeIconPreview,
                  { shadowColor: theme.primary, borderColor: theme.border },
                ]}
                contentFit="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={[Typography.body, { color: theme.text }]}>App theme</Text>
                <Text style={[Typography.caption, { color: theme.textSubtle, marginTop: 2 }]}>
                  {theme.name} · {theme.tagline}
                </Text>
              </View>
              <Text style={{ color: theme.textMuted, fontSize: 22 }}>›</Text>
            </Pressable>
          </NuvexaCard>
        </View>

        <View style={{ marginTop: Spacing.xl }}>
          <TerminalLabel color={theme.textMuted}>PLANS</TerminalLabel>
          <NuvexaCard style={{ marginTop: Spacing.sm }}>
            <Pressable
              style={styles.themeRow}
              onPress={() => router.push("/(auth)/pricing")}
            >
              <View
                style={[
                  styles.themeSwatch,
                  { backgroundColor: theme.reward, shadowColor: theme.reward },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={[Typography.body, { color: theme.text }]}>Plans & pricing</Text>
                <Text style={[Typography.caption, { color: theme.textSubtle, marginTop: 2 }]}>
                  ROI calculator · ₹499 / ₹999 / ₹1999
                </Text>
              </View>
              <Text style={{ color: theme.textMuted, fontSize: 22 }}>›</Text>
            </Pressable>
          </NuvexaCard>
        </View>

        <View style={{ marginTop: Spacing.xl }}>
          <TerminalLabel color={theme.textMuted}>SETTINGS</TerminalLabel>
          <NuvexaCard style={{ marginTop: Spacing.sm }}>
            <SettingRow
              label="Edit profile"
              onPress={() => Alert.alert("Edit profile", "Username, display name, avatar, bio — v0.2.")}
            />
            <Divider />
            <SettingRow
              label="Notifications"
              onPress={() => Alert.alert("Notifications", "Push prefs land with Edge Function APNS integration.")}
            />
            <Divider />
            <SettingRow
              label="Privacy & data"
              onPress={() => Alert.alert("Privacy", "Export data, delete account — required for App Store.")}
            />
            <Divider />
            <SettingRow
              label="Help & support"
              onPress={() => Alert.alert("Help", "Reach piyush at HYPD for now.")}
            />
          </NuvexaCard>
        </View>

        <View style={{ marginTop: Spacing.xl }}>
          <NuvexaButton label="Sign out" variant="secondary" onPress={signOut} />
        </View>

        <Text
          style={{
            ...Typography.mono,
            color: theme.textMuted,
            textAlign: "center",
            marginTop: Spacing.xxl,
            fontSize: 10,
          }}
        >
          $ NUVEXA_LEARNING · v1.0.0 · ios
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text
        style={[
          { ...Typography.mono, fontSize: 20, fontWeight: "700" },
          { color: accent ? theme.primary : theme.text },
          accent && {
            textShadowColor: theme.primary,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 6,
          },
        ]}
      >
        {value}
      </Text>
      <Text style={[Typography.terminal, { color: theme.textMuted, marginTop: 4, fontSize: 9 }]}>
        {label}
      </Text>
    </View>
  );
}

function SettingRow({ label, onPress }: { label: string; onPress?: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.settingRow}>
      <Text style={[Typography.body, { color: theme.text }]}>{label}</Text>
      <Text style={{ color: theme.textMuted, fontSize: 22 }}>›</Text>
    </Pressable>
  );
}

function Divider() {
  const { theme } = useTheme();
  return <View style={{ height: 1, backgroundColor: theme.border }} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  identityRow: { flexDirection: "row", alignItems: "center", marginTop: Spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  statRow: { flexDirection: "row", alignItems: "center" },
  statDivider: { width: 1, height: 36 },
  themeRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingVertical: Spacing.sm },
  themeSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  themeIconPreview: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
});
