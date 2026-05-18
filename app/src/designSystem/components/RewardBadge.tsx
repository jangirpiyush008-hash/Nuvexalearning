import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Spacing, Typography } from "..";
import { useTheme } from "@/themes/ThemeProvider";

export function RewardBadge({
  amountPaise,
  label = "AI CREDITS",
}: {
  amountPaise: number;
  label?: string;
}) {
  const { theme } = useTheme();
  const formatted = `₹${(amountPaise / 100).toLocaleString("en-IN")}`;
  // Reward uses theme's reward color → primary fallback gradient
  const colors: [string, string] = [theme.reward, "#FFFFFF"];
  const textColor = "#000000";

  return (
    <View
      style={{
        shadowColor: theme.reward,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.65,
        shadowRadius: 28,
        elevation: 12,
      }}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.wrap,
          { borderRadius: theme.btnRadius === 0 ? 0 : 999 },
        ]}
      >
        <Text style={[Typography.titleS, { color: textColor }]}>{formatted}</Text>
        <View style={[styles.divider, { backgroundColor: textColor }]} />
        <Text style={[Typography.terminal, { color: textColor }]}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  divider: { width: 1, height: 16, marginHorizontal: Spacing.sm, opacity: 0.3 },
});
