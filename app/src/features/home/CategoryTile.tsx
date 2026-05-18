import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/themes/ThemeProvider";
import { Spacing, Typography } from "@/designSystem";

// Rich category tile (2-col grid). Replaces flat chip row.
// Each tile has a gradient art panel + emoji + name + course count.
export function CategoryTile({
  name,
  emoji,
  count,
  gradient,
  active,
  onPress,
}: {
  name: string;
  emoji: string;
  count: number;
  gradient: readonly [string, string];
  active: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={[
        styles.wrap,
        {
          borderColor: active ? theme.primary : theme.border,
          borderWidth: active ? 2 : 1,
          borderRadius: theme.cardRadius,
          backgroundColor: theme.surfaceCard,
          shadowColor: active ? theme.primary : "transparent",
        },
      ]}
    >
      <LinearGradient
        colors={[...gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.art}
      >
        <Text style={styles.emoji}>{emoji}</Text>
      </LinearGradient>
      <View style={styles.body}>
        <Text style={[Typography.titleS, { color: theme.text, fontSize: 14 }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[Typography.caption, { color: theme.textMuted, marginTop: 2 }]}>
          {count} courses
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  art: {
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 28 },
  body: { padding: Spacing.md },
});
