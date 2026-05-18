import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { useTheme } from "@/themes/ThemeProvider";
import { Spacing, Typography, NuvexaButton, NuvexaCard, TerminalLabel } from "@/designSystem";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const PLAY_H = SCREEN_H * 0.62;
const BUBBLE_SIZE = 64;

// ─── concept bubbles (good) ────────────────────────────────────────────
const CONCEPTS = [
  { label: "TOKEN", color: "#FFD93D" },
  { label: "PROMPT", color: "#FF5E94" },
  { label: "CONTEXT", color: "#6BCB77" },
  { label: "EMBED", color: "#4D96FF" },
  { label: "VECTOR", color: "#FF8C42" },
  { label: "RAG", color: "#A78BFA" },
];

type Bubble = {
  id: number;
  kind: "concept" | "hallucination";
  label: string;
  color: string;
  x: number; // 0..1
  y: number; // 0..1
  drift: number; // horizontal sine wobble seed
  bornAt: number;
  ttl: number; // ms
};

let nextId = 1;

export default function Arcade() {
  const router = useRouter();
  const { theme } = useTheme();

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hiScore, setHiScore] = useState(0);
  const [tick, setTick] = useState(0);

  const startTime = useRef(0);

  const start = () => {
    setScore(0);
    setLives(3);
    setBubbles([]);
    setGameOver(false);
    setRunning(true);
    startTime.current = Date.now();
  };

  // spawn loop
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const elapsedSec = (Date.now() - startTime.current) / 1000;
      // Increase difficulty: more hallucinations as time goes on
      const hallucinationChance = Math.min(0.45, 0.18 + elapsedSec * 0.01);
      const isBad = Math.random() < hallucinationChance;
      const ttl = 2400 - Math.min(900, elapsedSec * 30); // bubbles shrink window over time
      const concept = CONCEPTS[Math.floor(Math.random() * CONCEPTS.length)];

      const b: Bubble = isBad
        ? {
            id: nextId++,
            kind: "hallucination",
            label: "OOPS",
            color: "#FF3B5C",
            x: 0.08 + Math.random() * 0.84,
            y: 0.08 + Math.random() * 0.78,
            drift: Math.random() * Math.PI * 2,
            bornAt: Date.now(),
            ttl,
          }
        : {
            id: nextId++,
            kind: "concept",
            label: concept.label,
            color: concept.color,
            x: 0.08 + Math.random() * 0.84,
            y: 0.08 + Math.random() * 0.78,
            drift: Math.random() * Math.PI * 2,
            bornAt: Date.now(),
            ttl,
          };
      setBubbles((b0) => [...b0, b]);
    }, 700);
    return () => clearInterval(id);
  }, [running]);

  // age-out / expiry — bubbles disappear after ttl, but missed concepts cost nothing
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const now = Date.now();
      setBubbles((b0) => b0.filter((b) => now - b.bornAt < b.ttl));
      setTick((t) => t + 1);
    }, 120);
    return () => clearInterval(id);
  }, [running]);

  // end-game guard
  useEffect(() => {
    if (lives <= 0 && running) {
      setRunning(false);
      setGameOver(true);
      setHiScore((s) => Math.max(s, score));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [lives, running, score]);

  const onTap = (b: Bubble) => {
    setBubbles((b0) => b0.filter((x) => x.id !== b.id));
    if (b.kind === "concept") {
      setScore((s) => s + 10);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setLives((l) => l - 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* HUD */}
        <View style={styles.hud}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={[Typography.terminal, { color: theme.textSubtle, fontSize: 12 }]}>← exit</Text>
          </Pressable>
          <TerminalLabel>ARCADE · PROMPT_POP</TerminalLabel>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.scoreRow}>
          <View style={[styles.scoreCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <Text style={[styles.scoreLbl, { color: theme.textMuted }]}>SCORE</Text>
            <Text style={[styles.scoreVal, { color: theme.text }]}>{score.toString().padStart(3, "0")}</Text>
          </View>
          <View style={[styles.scoreCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <Text style={[styles.scoreLbl, { color: theme.textMuted }]}>LIVES</Text>
            <Text style={[styles.scoreVal, { color: theme.danger }]}>{"❤".repeat(lives)}{"♡".repeat(3 - lives)}</Text>
          </View>
          <View style={[styles.scoreCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <Text style={[styles.scoreLbl, { color: theme.textMuted }]}>BEST</Text>
            <Text style={[styles.scoreVal, { color: theme.accent1 }]}>{hiScore.toString().padStart(3, "0")}</Text>
          </View>
        </View>

        {/* play area */}
        <View style={[styles.field, { borderColor: theme.border, backgroundColor: theme.surfaceCard }]}>
          {!running && !gameOver && (
            <View style={styles.center}>
              <Text style={[Typography.terminal, { color: theme.primary, fontSize: 12, marginBottom: 8 }]}>
                $ READY_PLAYER_ONE
              </Text>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 30,
                  fontWeight: "900",
                  letterSpacing: -0.5,
                  textAlign: "center",
                }}
              >
                Prompt Pop
              </Text>
              <Text style={[Typography.body, { color: theme.textSubtle, marginTop: 10, textAlign: "center", paddingHorizontal: 32 }]}>
                Tap concept bubbles for points.{"\n"}
                <Text style={{ color: theme.danger }}>Avoid spiky red OOPS</Text> — hallucinations cost a life.
              </Text>

              {/* TOP-3 REWARDS PANEL */}
              <View style={[styles.rewards, { borderColor: theme.reward }]}>
                <Text style={[styles.rewardsLabel, { color: theme.reward, textShadowColor: theme.reward }]}>
                  $ TOP_3_WEEKLY · CLAUDE_TOKENS
                </Text>
                <View style={styles.rewardRow}>
                  <Text style={styles.medal}>🥇</Text>
                  <Text style={[styles.rewardRank, { color: theme.text }]}>1st</Text>
                  <Text style={[styles.rewardAmt, { color: theme.reward, textShadowColor: theme.reward }]}>1,00,000</Text>
                </View>
                <View style={styles.rewardRow}>
                  <Text style={styles.medal}>🥈</Text>
                  <Text style={[styles.rewardRank, { color: theme.text }]}>2nd</Text>
                  <Text style={[styles.rewardAmt, { color: theme.primary }]}>50,000</Text>
                </View>
                <View style={styles.rewardRow}>
                  <Text style={styles.medal}>🥉</Text>
                  <Text style={[styles.rewardRank, { color: theme.text }]}>3rd</Text>
                  <Text style={[styles.rewardAmt, { color: theme.accent1 }]}>25,000</Text>
                </View>
              </View>

              <View style={{ height: 16 }} />
              <View style={{ width: 220 }}>
                <NuvexaButton label="Start game" onPress={start} />
              </View>
            </View>
          )}

          {gameOver && (
            <View style={styles.center}>
              <Text style={[Typography.terminal, { color: theme.danger, fontSize: 12 }]}>$ GAME_OVER</Text>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 48,
                  fontWeight: "900",
                  marginTop: 8,
                  textShadowColor: theme.primary,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 14,
                }}
              >
                {score}
              </Text>
              <Text style={[Typography.body, { color: theme.textSubtle, marginTop: 4 }]}>
                {score > hiScore ? "🏆 new best!" : `best: ${hiScore}`}
              </Text>
              <View style={{ height: 20 }} />
              <View style={{ width: 220 }}>
                <NuvexaButton label="Play again" onPress={start} />
                <View style={{ height: 8 }} />
                <NuvexaButton label="Back" variant="ghost" onPress={() => router.back()} />
              </View>
            </View>
          )}

          {running &&
            bubbles.map((b) => <BubbleSprite key={b.id} bubble={b} onTap={onTap} />)}
        </View>

        {/* footer hint */}
        {running && (
          <Text style={[Typography.caption, { color: theme.textMuted, textAlign: "center", marginTop: 12 }]}>
            $ keep popping · {Math.floor((Date.now() - startTime.current) / 1000)}s
          </Text>
        )}
      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function BubbleSprite({ bubble, onTap }: { bubble: Bubble; onTap: (b: Bubble) => void }) {
  const isBad = bubble.kind === "hallucination";
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.4);
  const wobble = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) }),
      withDelay(bubble.ttl - 600, withTiming(0, { duration: 300 })),
    );
    scale.value = withSequence(
      withTiming(1.0, { duration: 280, easing: Easing.out(Easing.back(2)) }),
      withDelay(bubble.ttl - 600, withTiming(0.4, { duration: 300 })),
    );
    wobble.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    return () => {
      cancelAnimation(opacity);
      cancelAnimation(scale);
      cancelAnimation(wobble);
    };
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: wobble.value * 6 },
      { translateY: wobble.value * -4 },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left: bubble.x * (SCREEN_W - 80) - BUBBLE_SIZE / 2 + 16,
          top: bubble.y * (PLAY_H - 80) - BUBBLE_SIZE / 2 + 16,
        },
        style,
      ]}
    >
      <Pressable onPress={() => onTap(bubble)} hitSlop={8}>
        {isBad ? (
          <SpikyBad color={bubble.color} />
        ) : (
          <View
            style={[
              styles.bubbleBody,
              {
                backgroundColor: bubble.color,
                shadowColor: bubble.color,
              },
            ]}
          >
            <View style={styles.bubbleEyeRow}>
              <View style={styles.bubbleEye} />
              <View style={styles.bubbleEye} />
            </View>
            <Text style={styles.bubbleLabel}>{bubble.label}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function SpikyBad({ color }: { color: string }) {
  // 8 triangular spikes around a circular body
  return (
    <View style={styles.spikyWrap}>
      {Array.from({ length: 8 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.spike,
            {
              backgroundColor: color,
              transform: [{ rotate: `${i * 45}deg` }],
            },
          ]}
        />
      ))}
      <View style={[styles.bubbleBody, { backgroundColor: color, shadowColor: color }]}>
        <View style={styles.bubbleEyeRow}>
          <Text style={styles.spikyEye}>✕</Text>
          <Text style={styles.spikyEye}>✕</Text>
        </View>
        <Text style={[styles.bubbleLabel, { color: "#FFFFFF" }]}>OOPS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: Spacing.lg,
    marginTop: 12,
  },
  scoreCard: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
  },
  scoreLbl: { fontSize: 9, fontWeight: "700", letterSpacing: 1.6, fontFamily: "Menlo" },
  scoreVal: { fontSize: 18, fontWeight: "900", marginTop: 2, fontFamily: "Menlo" },

  field: {
    marginHorizontal: Spacing.lg,
    marginTop: 14,
    height: PLAY_H,
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },
  center: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },

  bubble: {
    position: "absolute",
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
  },
  bubbleBody: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#1A1A1A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  bubbleEyeRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  bubbleEye: {
    width: 6,
    height: 8,
    borderRadius: 3,
    backgroundColor: "#1A1A1A",
  },
  bubbleLabel: {
    color: "#1A1A1A",
    fontSize: 9,
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: 0.3,
  },

  spikyWrap: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  spike: {
    position: "absolute",
    width: 18,
    height: 4,
    left: BUBBLE_SIZE - 12,
    top: BUBBLE_SIZE / 2 - 2,
    transformOrigin: "left center" as any,
  },
  spikyEye: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },

  rewards: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    paddingHorizontal: 18,
    minWidth: 280,
  },
  rewardsLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
    fontFamily: "Menlo",
    textAlign: "center",
    marginBottom: 8,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    gap: 10,
  },
  medal: { fontSize: 20 },
  rewardRank: { fontSize: 13, fontWeight: "700", width: 36 },
  rewardAmt: {
    fontSize: 16,
    fontWeight: "900",
    flex: 1,
    textAlign: "right",
    fontFamily: "Menlo",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
