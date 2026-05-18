import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/themes/ThemeProvider";
import { Spacing, Typography } from "@/designSystem";

const WINS = [
  { name: "Arjun K.", amount: 10000, course: "Prompt Eng.", when: "2h ago" },
  { name: "Priya M.", amount: 200, course: "RAG in Prod", when: "4h ago" },
  { name: "Neha V.",  amount: 10000, course: "AI SaaS",     when: "5h ago" },
  { name: "Vikram",   amount: 200, course: "Prompt Eng.", when: "6h ago" },
  { name: "Ananya",   amount: 10000, course: "RAG in Prod", when: "9h ago" },
  { name: "Ravi",     amount: 200, course: "AI SaaS",     when: "12h ago" },
];

// Auto-rotating ticker of recent wins. Reinforces "this is real, people win."
export function LiveWinTicker() {
  const { theme } = useTheme();
  const [i, setI] = useState(0);
  const fade = useSharedValue(1);
  const ty = useSharedValue(0);

  useEffect(() => {
    const iv = setInterval(() => {
      fade.value = withTiming(0, { duration: 220, easing: Easing.in(Easing.cubic) });
      ty.value = withTiming(-10, { duration: 220, easing: Easing.in(Easing.cubic) }, () => {
        ty.value = 10;
        fade.value = withTiming(1, { duration: 280 });
        ty.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
      });
      setI((n) => (n + 1) % WINS.length);
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: ty.value }],
  }));

  const w = WINS[i];
  const top = w.amount === 10000;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.surfaceCard,
          borderColor: theme.border,
          borderRadius: theme.cardRadius,
          borderWidth: theme.effects.win95Bevel ? 0 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: top ? theme.reward : theme.primary, shadowColor: top ? theme.reward : theme.primary },
        ]}
      />
      <Text style={[styles.live, { color: theme.primary, textShadowColor: theme.primary }]}>● LIVE</Text>
      <Animated.View style={[{ flex: 1, marginLeft: Spacing.md }, style]}>
        <Text style={[Typography.bodyS, { color: theme.textSubtle }]} numberOfLines={1}>
          <Text style={{ color: theme.text, fontWeight: "700" }}>{w.name}</Text>
          {" won "}
          <Text style={{ color: top ? theme.reward : theme.primary, fontWeight: "800" }}>
            ₹{w.amount.toLocaleString("en-IN")}
          </Text>
          {" · "}
          {w.course}
        </Text>
        <Text style={[Typography.caption, { color: theme.textMuted, marginTop: 2 }]}>{w.when}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    marginRight: 6,
  },
  live: {
    ...Typography.terminal,
    fontSize: 9,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
