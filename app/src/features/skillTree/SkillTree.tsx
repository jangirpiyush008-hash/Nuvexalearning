import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/themes/ThemeProvider";
import { Spacing, Typography } from "@/designSystem";

// Skill node = a course / topic / certification.
// State: locked | available | inProgress | done.
type State = "locked" | "available" | "inProgress" | "done";

type Node = {
  id: string;
  label: string;
  state: State;
  pct?: number;
  emoji: string;
};

const TREE: Node[][] = [
  [
    { id: "n1", label: "Prompt Eng 101", state: "done", emoji: "🟢" },
  ],
  [
    { id: "n2", label: "Tool Use", state: "inProgress", pct: 42, emoji: "🛠" },
    { id: "n3", label: "Structured Output", state: "available", emoji: "🧩" },
  ],
  [
    { id: "n4", label: "RAG Basics", state: "inProgress", pct: 18, emoji: "🔍" },
    { id: "n5", label: "Agents", state: "locked", emoji: "🤖" },
  ],
  [
    { id: "n6", label: "AI SaaS", state: "locked", emoji: "🚀" },
    { id: "n7", label: "Voice & Speech", state: "locked", emoji: "🎙" },
  ],
  [{ id: "n8", label: "Founder Cert", state: "locked", emoji: "🏆" }],
];

export function SkillTree() {
  const { theme } = useTheme();
  return (
    <View>
      {TREE.map((row, ri) => (
        <View key={ri}>
          <View style={styles.row}>
            {row.map((n) => (
              <SkillNode key={n.id} node={n} />
            ))}
          </View>
          {ri < TREE.length - 1 && (
            <View style={styles.connector}>
              <View style={[styles.line, { backgroundColor: theme.border }]} />
              <View style={[styles.line, { backgroundColor: theme.border }]} />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function SkillNode({ node }: { node: Node }) {
  const { theme } = useTheme();
  const isOn = node.state === "done" || node.state === "inProgress";
  const isAvail = node.state === "available";
  const isLocked = node.state === "locked";

  return (
    <Pressable
      onPress={() =>
        Alert.alert(
          node.label,
          isLocked
            ? "Locked. Complete prerequisites first."
            : node.state === "done"
              ? "Completed. Tap to revisit."
              : node.state === "inProgress"
                ? `In progress · ${node.pct}% done.`
                : "Available. Tap to start.",
        )
      }
      style={[
        styles.node,
        {
          borderColor: isOn ? theme.primary : isAvail ? theme.accent1 : theme.border,
          borderWidth: isOn ? 2 : 1,
          backgroundColor: theme.surfaceCard,
          shadowColor: isOn ? theme.primary : "transparent",
          borderRadius: theme.cardRadius,
          opacity: isLocked ? 0.55 : 1,
        },
      ]}
    >
      {node.state === "done" ? (
        <LinearGradient
          colors={[...theme.primaryGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: theme.cardRadius, opacity: 0.18 }]}
        />
      ) : null}

      <Text style={styles.emoji}>{node.emoji}</Text>
      <Text
        style={[
          Typography.titleS,
          { color: theme.text, fontSize: 13, textAlign: "center", marginTop: 6 },
        ]}
        numberOfLines={2}
      >
        {node.label}
      </Text>
      {node.state === "inProgress" && (
        <Text style={[Typography.caption, { color: theme.primary, marginTop: 4 }]}>{node.pct}%</Text>
      )}
      {node.state === "done" && (
        <Text style={[Typography.terminal, { color: theme.primary, marginTop: 4, fontSize: 9 }]}>✓ DONE</Text>
      )}
      {node.state === "locked" && (
        <Text style={[Typography.terminal, { color: theme.textMuted, marginTop: 4, fontSize: 9 }]}>🔒 LOCKED</Text>
      )}
      {node.state === "available" && (
        <Text style={[Typography.terminal, { color: theme.accent1, marginTop: 4, fontSize: 9 }]}>OPEN</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
  },
  connector: {
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 24,
  },
  line: { width: 1, height: 24 },
  node: {
    width: 140,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.sm,
    overflow: "hidden",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  emoji: { fontSize: 28 },
});
