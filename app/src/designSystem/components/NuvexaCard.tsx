import React, { ReactNode } from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import { Shadows, Spacing } from "..";
import { useTheme } from "@/themes/ThemeProvider";

export function NuvexaCard({
  children,
  style,
  variant = "card",
}: {
  children: ReactNode;
  style?: ViewStyle;
  variant?: "card" | "elevated";
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: variant === "elevated" ? theme.surfaceElevated : theme.surfaceCard,
          borderColor: theme.border,
          borderRadius: theme.cardRadius,
          borderWidth: theme.effects.pixelGrid ? 2 : 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: Spacing.lg,
    ...Shadows.card,
  },
});
