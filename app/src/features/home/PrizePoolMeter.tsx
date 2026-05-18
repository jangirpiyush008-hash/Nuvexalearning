import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/themes/ThemeProvider";
import { Spacing, Typography } from "@/designSystem";

// Monthly prize pool indicator. Scarcity device — "62/100 spots left".
export function PrizePoolMeter({
  remaining = 62,
  total = 100,
  daysLeft = 14,
}: {
  remaining?: number;
  total?: number;
  daysLeft?: number;
}) {
  const { theme } = useTheme();
  const pct = remaining / total;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.surfaceCard,
          borderColor: theme.borderStrong ?? theme.border,
          borderRadius: theme.cardRadius,
          borderWidth: 1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: theme.accent2 ?? theme.primary, textShadowColor: theme.accent2 ?? theme.primary }]}>
          $ MONTHLY_PRIZE_POOL
        </Text>
        <Text style={[Typography.caption, { color: theme.textMuted }]}>{daysLeft}d left</Text>
      </View>

      <View style={styles.numbers}>
        <Text style={[Typography.displayL, { color: theme.text, fontSize: 36, fontWeight: "900" }]}>
          {remaining}
          <Text style={{ color: theme.textMuted, fontSize: 22 }}>/{total}</Text>
        </Text>
        <Text style={[Typography.caption, { color: theme.textSubtle, marginTop: 2 }]}>
          ₹10,000 winner spots remaining
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View style={{ width: `${pct * 100}%`, height: "100%", borderRadius: 999, overflow: "hidden" }}>
          <LinearGradient
            colors={[...theme.primaryGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: Spacing.lg },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.terminal,
    fontSize: 10,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  numbers: { marginBottom: Spacing.md },
  track: { height: 8, borderRadius: 999, overflow: "hidden" },
});
