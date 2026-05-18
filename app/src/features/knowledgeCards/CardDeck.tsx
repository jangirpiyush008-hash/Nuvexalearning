import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useTheme } from "@/themes/ThemeProvider";
import { Spacing, Typography } from "@/designSystem";
import { CARDS } from "./cards";

const { width } = Dimensions.get("window");
const CARD_W = width - Spacing.xl * 2;
const CARD_H = 280;

// Swipeable flashcard deck. Tap to flip front/back. Swipe right to "got it",
// left to "still learning" (re-queues to end of deck).
export function CardDeck() {
  const { theme } = useTheme();
  const [stack, setStack] = useState(CARDS);
  const [flipped, setFlipped] = useState(false);
  const tx = useSharedValue(0);
  const rot = useSharedValue(0);

  const top = stack[0];
  const next = stack[1];

  if (!top) {
    return (
      <View style={styles.empty}>
        <Text style={[Typography.titleM, { color: theme.text }]}>You're cleared out.</Text>
        <Text style={[Typography.body, { color: theme.textSubtle, marginTop: 6, textAlign: "center" }]}>
          New cards drop daily as you finish lessons. Come back tomorrow.
        </Text>
        <Pressable
          onPress={() => {
            setStack(CARDS);
            setFlipped(false);
          }}
          style={[styles.resetBtn, { borderColor: theme.border }]}
        >
          <Text style={[Typography.terminal, { color: theme.primary, fontSize: 11 }]}>↺ RESET</Text>
        </Pressable>
      </View>
    );
  }

  const dismiss = (direction: "left" | "right") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStack((s) => {
      const [first, ...rest] = s;
      return direction === "left" ? [...rest, first] : rest;
    });
    setFlipped(false);
    tx.value = 0;
    rot.value = 0;
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      tx.value = e.translationX;
      rot.value = (e.translationX / width) * 12;
    })
    .onEnd((e) => {
      const T = 120;
      if (Math.abs(e.translationX) > T) {
        const dir = e.translationX > 0 ? "right" : "left";
        tx.value = withTiming(e.translationX > 0 ? width : -width, { duration: 250, easing: Easing.out(Easing.cubic) }, () => {
          runOnJS(dismiss)(dir);
        });
      } else {
        tx.value = withSpring(0);
        rot.value = withSpring(0);
      }
    });

  const topStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { rotateZ: `${rot.value}deg` }],
  }));

  const yesOpacity = useAnimatedStyle(() => ({ opacity: Math.max(0, tx.value / 100) }));
  const noOpacity = useAnimatedStyle(() => ({ opacity: Math.max(0, -tx.value / 100) }));

  return (
    <View style={styles.wrap}>
      <Text style={[Typography.terminal, { color: theme.textMuted, fontSize: 10, alignSelf: "center", marginBottom: Spacing.md }]}>
        $ KNOWLEDGE_CARDS · {stack.length} LEFT · TAP TO FLIP · SWIPE TO ADVANCE
      </Text>

      <View style={styles.stage}>
        {next && (
          <View
            style={[
              styles.card,
              styles.cardBehind,
              { backgroundColor: theme.surfaceCard, borderColor: theme.border, borderRadius: theme.cardRadius },
            ]}
          >
            <Text style={[styles.course, { color: theme.textMuted }]}>{next.course.toUpperCase()}</Text>
          </View>
        )}

        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: theme.surfaceCard, borderColor: theme.primary, borderRadius: theme.cardRadius, shadowColor: theme.primary },
              topStyle,
            ]}
          >
            <Pressable onPress={() => { setFlipped((f) => !f); Haptics.selectionAsync(); }} style={{ flex: 1, padding: Spacing.lg }}>
              <Text style={[styles.course, { color: theme.primary, textShadowColor: theme.primary }]}>{top.course.toUpperCase()}</Text>
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                {!flipped ? (
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 22,
                      fontWeight: theme.displayWeight,
                      textAlign: "center",
                      letterSpacing: -0.3,
                    }}
                  >
                    {top.front}
                  </Text>
                ) : (
                  <Text style={[Typography.body, { color: theme.text, textAlign: "left", lineHeight: 24 }]}>
                    {top.back}
                  </Text>
                )}
              </View>
              <Text style={[Typography.caption, { color: theme.textMuted, textAlign: "center" }]}>
                {flipped ? "tap to flip back" : "tap to reveal"}
              </Text>
            </Pressable>

            {/* Swipe hint overlays */}
            <Animated.View style={[styles.badge, styles.badgeYes, { borderColor: theme.primary }, yesOpacity]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>GOT IT ✓</Text>
            </Animated.View>
            <Animated.View style={[styles.badge, styles.badgeNo, { borderColor: theme.danger }, noOpacity]}>
              <Text style={[styles.badgeText, { color: theme.danger }]}>STILL LEARNING</Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => dismiss("left")}
          style={[styles.action, { borderColor: theme.danger }]}
        >
          <Text style={[Typography.terminal, { color: theme.danger, fontSize: 11 }]}>← STILL LEARNING</Text>
        </Pressable>
        <Pressable
          onPress={() => dismiss("right")}
          style={[styles.action, { borderColor: theme.primary, shadowColor: theme.primary }]}
        >
          <Text style={[Typography.terminal, { color: theme.primary, fontSize: 11 }]}>GOT IT ✓ →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: Spacing.md },
  stage: { height: CARD_H + 20, alignItems: "center", justifyContent: "center" },
  card: {
    position: "absolute",
    width: CARD_W,
    height: CARD_H,
    borderWidth: 2,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },
  cardBehind: {
    top: 8,
    transform: [{ scale: 0.96 }],
    opacity: 0.5,
  },
  course: {
    ...Typography.terminal,
    fontSize: 10,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  badge: {
    position: "absolute",
    top: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 2,
    borderRadius: 8,
    transform: [{ rotateZ: "-12deg" }],
  },
  badgeYes: { right: 16, transform: [{ rotateZ: "12deg" }] },
  badgeNo: { left: 16 },
  badgeText: { ...Typography.terminal, fontSize: 11 },

  actionsRow: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.lg },
  action: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 999,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },

  empty: { padding: Spacing.xl, alignItems: "center", paddingTop: Spacing.xxxl },
  resetBtn: { marginTop: Spacing.xl, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderRadius: 999 },
});
