import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/themes/ThemeProvider";
import { Spacing, Typography } from "@/designSystem";
import { WEEKLY_LEADERBOARD, rankFor, type LeaderboardEntry } from "./leaderboard";

export function LeaderboardPanel({ yourScore }: { yourScore?: number }) {
  const { theme } = useTheme();
  const yourRank = yourScore != null ? rankFor(yourScore) : null;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.surfaceCard,
          borderColor: theme.border,
          borderRadius: theme.cardRadius,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary, textShadowColor: theme.primary }]}>
          $ WEEKLY_LEADERBOARD
        </Text>
        {yourRank != null && yourRank <= 10 ? (
          <Text style={[styles.youBadge, { color: theme.accent1, borderColor: theme.accent1 }]}>
            YOU · #{yourRank}
          </Text>
        ) : null}
      </View>

      <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
        {WEEKLY_LEADERBOARD.map((e) => (
          <Row key={e.rank} entry={e} isYou={yourRank === e.rank} />
        ))}
        {yourRank != null && yourRank > WEEKLY_LEADERBOARD.length ? (
          <View style={[styles.youRow, { borderTopColor: theme.border, backgroundColor: theme.surfaceElevated }]}>
            <Text style={[styles.rank, { color: theme.text }]}>#{yourRank}</Text>
            <Text style={[styles.handle, { color: theme.accent1 }]}>you</Text>
            <Text style={[styles.score, { color: theme.text }]}>{yourScore}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Row({ entry, isYou }: { entry: LeaderboardEntry; isYou: boolean }) {
  const { theme } = useTheme();
  const medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : null;
  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: theme.border },
        isYou && { backgroundColor: theme.primary + "22" },
      ]}
    >
      <View style={styles.rankCell}>
        {medal ? (
          <Text style={styles.medal}>{medal}</Text>
        ) : (
          <Text style={[styles.rank, { color: theme.textMuted }]}>#{entry.rank}</Text>
        )}
      </View>
      <Text
        style={[
          styles.handle,
          { color: isYou ? theme.accent1 : theme.text },
        ]}
        numberOfLines={1}
      >
        @{entry.handle}
      </Text>
      {entry.reward ? (
        <Text style={[styles.reward, { color: theme.reward, textShadowColor: theme.reward }]}>
          {entry.reward}
        </Text>
      ) : null}
      <Text style={[styles.score, { color: theme.text }]}>{entry.score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: Spacing.md, borderWidth: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
    fontFamily: "Menlo",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  youBadge: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    fontFamily: "Menlo",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 999,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  youRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 2,
    paddingHorizontal: 4,
    gap: 8,
  },
  rankCell: { width: 36, alignItems: "center" },
  medal: { fontSize: 20 },
  rank: { ...Typography.mono, fontSize: 13, fontWeight: "700" },
  handle: { ...Typography.bodyS, fontWeight: "600", flex: 1 },
  reward: {
    fontSize: 10,
    fontWeight: "800",
    fontFamily: "Menlo",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  score: {
    ...Typography.mono,
    fontSize: 14,
    fontWeight: "800",
    minWidth: 50,
    textAlign: "right",
  },
});
