import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/themes/ThemeProvider";
import { Spacing, Typography } from "@/designSystem";
import { StreakSaveModal } from "@/features/streak/StreakSaveModal";

export function StreakStrip({ days = 7, credits = 200 }: { days?: number; credits?: number }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [savedDays, setSavedDays] = useState(days);

  return (
    <>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          setOpen(true);
        }}
        style={[
          styles.wrap,
          {
            backgroundColor: theme.surfaceCard,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: 999,
          },
        ]}
      >
        <View style={styles.cell}>
          <Text style={styles.fire}>🔥</Text>
          <Text style={[Typography.titleS, { color: theme.text, fontSize: 14 }]}>{savedDays}</Text>
          <Text style={[Typography.caption, { color: theme.textMuted, marginLeft: 4 }]}>day streak</Text>
        </View>
        <View style={[styles.sep, { backgroundColor: theme.border }]} />
        <View style={styles.cell}>
          <Text style={[styles.coin, { color: theme.primary, textShadowColor: theme.primary }]}>₹</Text>
          <Text style={[Typography.titleS, { color: theme.text, fontSize: 14 }]}>{credits}</Text>
          <Text style={[Typography.caption, { color: theme.textMuted, marginLeft: 4 }]}>credits</Text>
        </View>
      </Pressable>

      <StreakSaveModal
        visible={open}
        streakDays={savedDays}
        costCredits={50}
        onFreeze={() => {
          setOpen(false);
          Alert.alert("Streak frozen", `Spent 50 credits. ${savedDays}-day streak safe until tomorrow.`);
        }}
        onLetItGo={() => {
          setOpen(false);
          setSavedDays(0);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  cell: { flexDirection: "row", alignItems: "center", paddingHorizontal: 4 },
  sep: { width: 1, height: 16, marginHorizontal: 6 },
  fire: { fontSize: 14, marginRight: 4 },
  coin: {
    fontSize: 14,
    fontWeight: "800",
    marginRight: 4,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
