import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Spacing, Typography } from "..";
import { useTheme } from "@/themes/ThemeProvider";

export function CountdownTimer({
  totalSeconds,
  remainingSeconds,
  onExpire,
}: {
  totalSeconds: number;
  remainingSeconds: number;
  onExpire?: () => void;
}) {
  const { theme } = useTheme();
  const [remaining, setRemaining] = useState(remainingSeconds);
  const widthAnim = useRef(new Animated.Value((remainingSeconds / totalSeconds) * 100)).current;

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const id = setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1);
        Animated.timing(widthAnim, {
          toValue: (next / totalSeconds) * 100,
          duration: 950,
          useNativeDriver: false,
        }).start();
        if (next === 0) onExpire?.();
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [remaining, onExpire, totalSeconds, widthAnim]);

  const widthPct = widthAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });
  const wantsTerminal = theme.id === "neon-os" || theme.id === "marvel" || theme.id === "glass-3d";

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.surfaceCard,
          borderRadius: theme.cardRadius,
          borderColor: theme.border,
          borderWidth: theme.effects.pixelGrid ? 2 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        <Text
          style={[
            Typography.terminal,
            {
              color: theme.primary,
              textShadowColor: theme.primary,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: wantsTerminal ? 6 : 0,
            },
          ]}
        >
          {wantsTerminal ? "$ FREE_TRIAL" : "FREE TRIAL"}
        </Text>
        <Text style={{ ...Typography.mono, color: theme.text, fontSize: 16 }}>{format(remaining)}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <Animated.View style={[{ width: widthPct, height: "100%" }]}>
          <LinearGradient
            colors={[...theme.primaryGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, borderRadius: 999 }}
          />
        </Animated.View>
      </View>
    </View>
  );
}

function format(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  wrap: { padding: Spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  track: { height: 6, borderRadius: 999, overflow: "hidden" },
});
