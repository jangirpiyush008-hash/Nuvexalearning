import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/themes/ThemeProvider";
import { Spacing, Typography } from "@/designSystem";

// The USP card — the single hero claim of Nuvexa.
// "Earn while you learn."
export function EarnCard() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/(tabs)/wallet");
      }}
      style={[styles.shadowWrap, { shadowColor: theme.reward }]}
    >
      <View
        style={[
          styles.wrap,
          {
            borderRadius: theme.cardRadius,
            borderColor: theme.reward,
            backgroundColor: theme.surfaceCard,
          },
        ]}
      >
        <LinearGradient
          colors={[theme.reward + "22", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.content}>
          <Text style={[styles.eyebrow, { color: theme.reward, textShadowColor: theme.reward }]}>
            $ USP · NUVEXA
          </Text>
          <Text
            style={{
              fontSize: 26,
              fontWeight: theme.displayWeight,
              color: theme.text,
              letterSpacing: -0.5,
              marginTop: 6,
              textTransform: theme.uppercase ? "uppercase" : "none",
              fontStyle: theme.italicHeadlines ? "italic" : "normal",
            }}
          >
            Earn{" "}
            <Text style={{ color: theme.reward }}>₹10,000</Text>{" "}
            while you{" "}
            <Text style={{ color: theme.primary }}>learn.</Text>
          </Text>
          <Text style={[Typography.body, { color: theme.textSubtle, marginTop: 8 }]}>
            Pass the final test with 95%+ → ₹10,000 in AI Credits. 70%+ → ₹200 + certificate. Real money. Real proof.
          </Text>

          <View style={styles.tiers}>
            <Tier label="95%+" amount="₹10,000" color={theme.reward} />
            <View style={[styles.tierDivider, { backgroundColor: theme.border }]} />
            <Tier label="70%+" amount="₹200" color={theme.primary} />
            <View style={[styles.tierDivider, { backgroundColor: theme.border }]} />
            <Tier label="<70%" amount="Retry" color={theme.textMuted} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function Tier({ label, amount, color }: { label: string; amount: string; color: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ ...Typography.mono, color, fontSize: 14, fontWeight: "800" }}>{label}</Text>
      <Text style={[Typography.bodyS, { color: theme.text, marginTop: 2, fontWeight: "700" }]}>
        {amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  wrap: { borderWidth: 1, overflow: "hidden" },
  content: { padding: Spacing.lg },
  eyebrow: {
    ...Typography.terminal,
    fontSize: 10,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  tiers: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  tierDivider: { width: 1, height: 28, marginHorizontal: 4 },
});
