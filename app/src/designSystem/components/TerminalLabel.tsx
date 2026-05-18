import React, { ReactNode } from "react";
import { Text, StyleSheet, TextStyle } from "react-native";
import { Typography } from "..";
import { useTheme } from "@/themes/ThemeProvider";

// Terminal-style overline. Accepts string OR array of strings (React inlines
// like `WELCOME · {var}` arrive as ["WELCOME · ", "foo"]).
export function TerminalLabel({
  children,
  color,
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: TextStyle;
}) {
  const { theme } = useTheme();
  const c = color ?? theme.primary;
  const wantsTerminal = theme.id === "neon-os" || theme.id === "marvel" || theme.id === "glass-3d";

  const raw = React.Children.toArray(children)
    .map((ch) => (typeof ch === "string" || typeof ch === "number" ? String(ch) : ""))
    .join("");
  const text = raw.startsWith("$") ? raw : wantsTerminal ? `$ ${raw}` : raw;

  return (
    <Text
      style={[
        styles.text,
        wantsTerminal && styles.glow,
        { color: c, textShadowColor: c },
        theme.id === "retro-90s" && styles.pixel,
        style,
      ]}
    >
      {text.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { ...Typography.terminal },
  glow: {
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  pixel: { fontFamily: "Courier", letterSpacing: 1.2 },
});
