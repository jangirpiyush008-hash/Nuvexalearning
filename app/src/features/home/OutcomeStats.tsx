import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/themes/ThemeProvider";
import { Spacing, Typography } from "@/designSystem";

// Social proof bar — "5,420 learners earned credits this month · ₹4.2 Cr paid out"
export function OutcomeStats() {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.surfaceCard,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: theme.cardRadius,
        },
      ]}
    >
      <Stat value="5,420" label="LEARNERS EARNED" />
      <View style={[styles.sep, { backgroundColor: theme.border }]} />
      <Stat value="₹4.2 Cr" label="PAID OUT" accent />
      <View style={[styles.sep, { backgroundColor: theme.border }]} />
      <Stat value="98.4%" label="WOULD RECOMMEND" />
    </View>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  const { theme } = useTheme();
  const color = accent ? theme.reward : theme.text;
  return (
    <View style={styles.cell}>
      <Text
        style={[
          {
            ...Typography.mono,
            color,
            fontSize: 16,
            fontWeight: "800",
          },
          accent && {
            textShadowColor: theme.reward,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 6,
          },
        ]}
      >
        {value}
      </Text>
      <Text style={[Typography.terminal, { color: theme.textMuted, marginTop: 2, fontSize: 8 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  cell: { flex: 1, alignItems: "center" },
  sep: { width: 1, height: 32 },
});
