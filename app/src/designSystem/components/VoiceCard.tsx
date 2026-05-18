import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Spacing, Typography } from "..";
import { useTheme } from "@/themes/ThemeProvider";
import { GradientChip } from "./GradientChip";

export type VoiceCardProps = {
  authorName: string;
  authorHandle: string;
  authorAvatarUrl?: string;
  verifiedCompleter?: boolean;
  text: string;
  outcomeTags?: string[];
  helpfulCount: number;
  createdAt: string;
};

export function VoiceCard(p: VoiceCardProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surfaceCard,
          borderRadius: theme.cardRadius,
          borderColor: theme.border,
          borderWidth: theme.effects.pixelGrid ? 2 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        {p.authorAvatarUrl ? (
          <Image source={{ uri: p.authorAvatarUrl }} style={[styles.avatar, { backgroundColor: theme.surfaceElevated }]} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: theme.surfaceElevated }]} />
        )}
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[Typography.titleS, { color: theme.text }]}>{p.authorName}</Text>
            {p.verifiedCompleter ? (
              <View style={{ marginLeft: Spacing.sm }}>
                <GradientChip label="Verified" />
              </View>
            ) : null}
          </View>
          <Text style={[Typography.caption, { color: theme.textSubtle }]}>
            @{p.authorHandle} · {formatDate(p.createdAt)}
          </Text>
        </View>
      </View>

      <Text style={[Typography.body, { color: theme.text, marginTop: Spacing.md }]}>{p.text}</Text>

      {p.outcomeTags && p.outcomeTags.length > 0 ? (
        <View style={styles.tagRow}>
          {p.outcomeTags.map((t) => (
            <View key={t} style={{ marginRight: Spacing.sm, marginTop: Spacing.sm }}>
              <GradientChip label={t} variant="outline" />
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        <Text style={[Typography.caption, { color: theme.textSubtle }]}>
          {p.helpfulCount} found helpful
        </Text>
      </View>
    </View>
  );
}

function formatDate(s: string): string {
  const d = new Date(s);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const styles = StyleSheet.create({
  card: { padding: Spacing.lg, marginBottom: Spacing.md },
  header: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  tagRow: { flexDirection: "row", flexWrap: "wrap" },
  footer: { marginTop: Spacing.md, flexDirection: "row", justifyContent: "space-between" },
});
