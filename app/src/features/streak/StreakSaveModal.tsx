import React from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { NuvexaButton, Spacing, Typography } from "@/designSystem";
import { useTheme } from "@/themes/ThemeProvider";

// Hits when the user is about to lose their streak. Offers to freeze with 50 credits.
// Wires AI Credits into the engagement loop (you earn them, then spend them on streak insurance).
export function StreakSaveModal({
  visible,
  streakDays,
  costCredits = 50,
  onFreeze,
  onLetItGo,
  onClose,
}: {
  visible: boolean;
  streakDays: number;
  costCredits?: number;
  onFreeze: () => void;
  onLetItGo: () => void;
  onClose: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          entering={ZoomIn.springify().damping(14).stiffness(160)}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surfaceCard,
              borderColor: theme.primary,
              borderRadius: theme.cardRadius,
              shadowColor: theme.primary,
            },
          ]}
        >
          <LinearGradient
            colors={[theme.primary + "22", "transparent"]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.content}>
            <Text style={styles.fire}>🔥</Text>
            <Text
              style={[
                styles.bigNum,
                {
                  color: theme.primary,
                  textShadowColor: theme.primary,
                },
              ]}
            >
              {streakDays}
            </Text>
            <Text style={[Typography.terminal, { color: theme.primary, fontSize: 11 }]}>
              $ STREAK_AT_RISK
            </Text>
            <Text
              style={{
                color: theme.text,
                fontSize: 22,
                fontWeight: theme.displayWeight,
                marginTop: Spacing.md,
                textAlign: "center",
                letterSpacing: -0.3,
              }}
            >
              Don't lose your {streakDays}-day streak.
            </Text>
            <Text style={[Typography.body, { color: theme.textSubtle, marginTop: Spacing.sm, textAlign: "center" }]}>
              Spend {costCredits} AI Credits to freeze today. Pick up tomorrow.
            </Text>

            <View style={{ marginTop: Spacing.xl, width: "100%" }}>
              <NuvexaButton
                label={`Freeze · ${costCredits} credits`}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  onFreeze();
                }}
              />
              <View style={{ height: Spacing.sm }} />
              <NuvexaButton label="Let it reset" variant="ghost" onPress={onLetItGo} />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  sheet: {
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.6,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 0 },
  },
  content: { padding: Spacing.xl, alignItems: "center" },
  fire: { fontSize: 56 },
  bigNum: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
    marginTop: 4,
  },
});
