import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "@/themes/ThemeProvider";
import { Spacing, Typography } from "@/designSystem";
import { todaysSprint } from "./sprintData";

export function DailySprintCard({ done = false }: { done?: boolean }) {
  const { theme } = useTheme();
  const router = useRouter();
  const s = todaysSprint();

  return (
    <Pressable onPress={() => router.push("/sprint")} style={{ marginVertical: Spacing.md }}>
      <View
        style={[
          styles.wrap,
          {
            borderColor: done ? theme.border : theme.primary,
            borderRadius: theme.cardRadius,
            backgroundColor: theme.surfaceCard,
            shadowColor: theme.primary,
          },
        ]}
      >
        <LinearGradient
          colors={[theme.primary + "22", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.eyebrow, { color: theme.primary, textShadowColor: theme.primary }]}>
              $ DAILY_AI_SPRINT · 60s
            </Text>
            {done ? (
              <View style={[styles.donePill, { borderColor: theme.primary }]}>
                <Text style={[Typography.terminal, { color: theme.primary, fontSize: 9 }]}>✓ DONE</Text>
              </View>
            ) : (
              <View style={[styles.streakPill, { backgroundColor: theme.primary }]}>
                <Text style={[Typography.terminal, { color: theme.onPrimary, fontSize: 9 }]}>+1 STREAK</Text>
              </View>
            )}
          </View>
          <Text style={[styles.topic, { color: theme.accent1 ?? theme.primary }]}>{s.topic}</Text>
          <Text
            style={{
              color: theme.text,
              fontSize: 20,
              fontWeight: theme.displayWeight,
              letterSpacing: -0.3,
              marginTop: 4,
              textTransform: theme.uppercase ? "uppercase" : "none",
              fontStyle: theme.italicHeadlines ? "italic" : "normal",
            }}
          >
            {s.title}
          </Text>
          <View style={styles.footer}>
            <Text style={[Typography.caption, { color: theme.textSubtle }]}>
              ~{s.estReadSeconds}s read · 1 quick question
            </Text>
            <Text style={[Typography.titleS, { color: theme.primary, fontSize: 14 }]}>
              Start →
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
  },
  content: { padding: Spacing.lg },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    ...Typography.terminal,
    fontSize: 10,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  streakPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  donePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  topic: {
    ...Typography.terminal,
    fontSize: 10,
    marginTop: Spacing.md,
  },
  footer: {
    marginTop: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
