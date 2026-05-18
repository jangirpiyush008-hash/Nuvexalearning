import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { Spacing, Typography } from "..";
import { useTheme } from "@/themes/ThemeProvider";

export function GradientChip({
  label,
  variant = "outline",
}: {
  label: string;
  variant?: "solid" | "outline" | "primary";
}) {
  const { theme } = useTheme();
  const v = variant === "primary" ? "solid" : variant;
  const wantsGlow = theme.id === "neon-os" || theme.id === "marvel" || theme.id === "glass-3d";

  if (v === "solid") {
    return (
      <View
        style={[
          styles.base,
          {
            backgroundColor: theme.primary,
            borderRadius: theme.btnRadius === 0 ? 0 : 999,
            shadowColor: theme.primary,
            shadowOpacity: wantsGlow ? 0.4 : 0,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        <Text
          style={[
            Typography.terminal,
            { color: theme.onPrimary },
            theme.id === "retro-90s" && { fontFamily: "Courier" },
          ]}
        >
          {label}
        </Text>
      </View>
    );
  }
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.surfaceCard,
          borderWidth: theme.effects.pixelGrid ? 2 : 1,
          borderColor: theme.border,
          borderRadius: theme.btnRadius === 0 ? 0 : 999,
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
            textShadowRadius: wantsGlow ? 6 : 0,
          },
          theme.id === "retro-90s" && { fontFamily: "Courier", textShadowRadius: 0 },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
});
