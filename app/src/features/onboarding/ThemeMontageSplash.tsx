import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { THEMES, THEME_ORDER } from "@/themes/themes";

const { width, height } = Dimensions.get("window");

const FLASH_MS = 560; // each theme card visible for this long
const FINALE_MS = 1200; // dramatic constellation finale

export function ThemeMontageSplash({ onFinish }: { onFinish: () => void }) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"strobe" | "finale" | "done">("strobe");

  const containerOpacity = useSharedValue(1);
  const slotProgress = useSharedValue(0); // 0→1 within each theme slot
  const finaleProgress = useSharedValue(0); // 0→1 during constellation

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
  }, []);

  // STROBE PHASE — cycle through each theme
  useEffect(() => {
    if (phase !== "strobe") return;

    slotProgress.value = 0;
    slotProgress.value = withTiming(1, { duration: FLASH_MS, easing: Easing.out(Easing.cubic) });

    const t = setTimeout(() => {
      Haptics.selectionAsync().catch(() => undefined);
      if (idx + 1 < THEME_ORDER.length) {
        setIdx(idx + 1);
      } else {
        setPhase("finale");
      }
    }, FLASH_MS);

    return () => clearTimeout(t);
  }, [phase, idx]);

  // FINALE PHASE — all themes converge
  useEffect(() => {
    if (phase !== "finale") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);

    finaleProgress.value = withTiming(
      1,
      { duration: FINALE_MS, easing: Easing.out(Easing.cubic) },
      () => {
        containerOpacity.value = withTiming(
          0,
          { duration: 480, easing: Easing.inOut(Easing.cubic) },
          (done) => {
            if (done) runOnJS(finish)();
          },
        );
      },
    );
  }, [phase]);

  const finish = () => {
    setPhase("done");
    onFinish();
  };

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));

  if (phase === "done") return null;

  const currentTheme = THEMES[THEME_ORDER[Math.min(idx, THEME_ORDER.length - 1)]];

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, containerStyle]}
      pointerEvents="none"
    >
      {/* Solid base */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: phase === "finale" ? "#000" : currentTheme.surface },
        ]}
      />

      {phase === "strobe" ? (
        <StrobeFrame theme={currentTheme} progress={slotProgress} idx={idx} />
      ) : (
        <FinaleFrame progress={finaleProgress} />
      )}

      {/* Progress strip — always visible */}
      <View style={styles.dots}>
        {THEME_ORDER.map((id, i) => (
          <DotCell key={id} active={i <= idx} isFinale={phase === "finale"} theme={THEMES[id]} />
        ))}
      </View>
    </Animated.View>
  );
}

// ── Single theme strobe frame ────────────────────────────────────────────
function StrobeFrame({
  theme,
  progress,
  idx,
}: {
  theme: (typeof THEMES)[keyof typeof THEMES];
  progress: { value: number };
  idx: number;
}) {
  // logo scales in + slight rotate
  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 0.5, 1], [0.6, 1.05, 1], Extrapolation.CLAMP) },
      { rotate: `${interpolate(progress.value, [0, 1], [-8, 0])}deg` },
    ],
    opacity: interpolate(progress.value, [0, 0.2], [0, 1], Extrapolation.CLAMP),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.25, 0.5], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0.25, 0.5], [12, 0], Extrapolation.CLAMP) },
    ],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.4, 0.7], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0.4, 0.7], [8, 0], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View style={styles.frame}>
      <LinearGradient
        colors={[...theme.primaryGradient, "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { opacity: 0.22 }]}
      />

      <View style={styles.center}>
        <Animated.View style={logoStyle}>
          <BigN color={theme.primary} glow />
        </Animated.View>

        <Animated.Text
          style={[
            styles.name,
            labelStyle,
            {
              color: theme.text,
              fontWeight: theme.displayWeight,
              textTransform: theme.uppercase ? "uppercase" : "none",
              fontStyle: theme.italicHeadlines ? "italic" : "normal",
            },
          ]}
        >
          {theme.name}
        </Animated.Text>

        <Animated.Text
          style={[
            styles.tagline,
            taglineStyle,
            { color: theme.primary, textShadowColor: theme.primary },
          ]}
        >
          $ THEME_{idx + 1}_OF_{THEME_ORDER.length} · {theme.tagline.toUpperCase()}
        </Animated.Text>
      </View>
    </View>
  );
}

// ── Finale: all 5 themes appear as a constellation, then wordmark ──────
function FinaleFrame({ progress }: { progress: { value: number } }) {
  return (
    <View style={styles.finale}>
      {/* Five mini-Ns radiating from center */}
      {THEME_ORDER.map((id, i) => (
        <FinaleSatellite key={id} theme={THEMES[id]} idx={i} progress={progress} />
      ))}
      <FinaleCore progress={progress} />
    </View>
  );
}

function FinaleSatellite({
  theme,
  idx,
  progress,
}: {
  theme: (typeof THEMES)[keyof typeof THEMES];
  idx: number;
  progress: { value: number };
}) {
  // Place 5 satellites in a ring around center
  const angle = (idx / THEME_ORDER.length) * Math.PI * 2 - Math.PI / 2;
  const radius = 140;
  const targetX = Math.cos(angle) * radius;
  const targetY = Math.sin(angle) * radius;
  const startDelay = idx * 0.05;

  const style = useAnimatedStyle(() => {
    const p = Math.max(0, Math.min(1, (progress.value - startDelay) / (0.5 - startDelay)));
    const collapseStart = 0.65;
    const collapse =
      progress.value < collapseStart
        ? 0
        : Math.min(1, (progress.value - collapseStart) / (1 - collapseStart));
    return {
      opacity: interpolate(p, [0, 1], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateX: targetX * p * (1 - collapse * 0.7) },
        { translateY: targetY * p * (1 - collapse * 0.7) },
        { scale: interpolate(p, [0, 1], [0.3, 1]) * (1 - collapse * 0.4) },
      ],
    };
  });

  return (
    <Animated.View style={[styles.satellite, style]}>
      <BigN color={theme.primary} size={68} glow />
    </Animated.View>
  );
}

function FinaleCore({ progress }: { progress: { value: number } }) {
  const wordmarkStyle = useAnimatedStyle(() => {
    const start = 0.7;
    const p = Math.max(0, Math.min(1, (progress.value - start) / (1 - start)));
    return {
      opacity: p,
      transform: [{ scale: interpolate(p, [0, 1], [0.9, 1]) }],
    };
  });

  const eyebrowStyle = useAnimatedStyle(() => {
    const start = 0.85;
    const p = Math.max(0, Math.min(1, (progress.value - start) / (1 - start)));
    return { opacity: p };
  });

  return (
    <View style={styles.coreContainer} pointerEvents="none">
      <Animated.View style={wordmarkStyle}>
        <Text style={styles.wordmark}>
          nuvexa<Text style={styles.wordmarkSub}>.learning</Text>
        </Text>
      </Animated.View>
      <Animated.Text style={[styles.eyebrowFinale, eyebrowStyle]}>
        $ FIVE_WORLDS · ONE_APP
      </Animated.Text>
    </View>
  );
}

// ── Reusable: glowing N logo ─────────────────────────────────────────────
function BigN({ color, size = 200, glow = false }: { color: string; size?: number; glow?: boolean }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {glow && (
        <View
          style={{
            position: "absolute",
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: size,
            backgroundColor: color,
            opacity: 0.18,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: size * 0.4,
          }}
        />
      )}
      <Svg width={size * 0.7} height={size * 0.7} viewBox="-120 -120 240 240">
        <Path
          d="M -90 120 L -90 -120 L -45 -120 L 65 105 L 65 -120 L 110 -120 L 110 120 L 65 120 L -45 -85 L -45 120 Z"
          fill={color}
        />
      </Svg>
    </View>
  );
}

function DotCell({
  active,
  isFinale,
  theme,
}: {
  active: boolean;
  isFinale: boolean;
  theme: (typeof THEMES)[keyof typeof THEMES];
}) {
  return (
    <View
      style={{
        width: isFinale || active ? 22 : 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 4,
        backgroundColor: active || isFinale ? theme.primary : "rgba(255,255,255,0.2)",
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isFinale ? 0.9 : active ? 0.7 : 0,
        shadowRadius: 8,
      }}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  frame: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center", justifyContent: "center" },

  name: {
    marginTop: 18,
    fontSize: 38,
    letterSpacing: -0.8,
  },
  tagline: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    fontFamily: "Menlo",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  finale: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  satellite: {
    position: "absolute",
  },
  coreContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  wordmarkSub: {
    color: "#888",
    fontWeight: "500",
  },
  eyebrowFinale: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
    fontFamily: "Menlo",
    opacity: 0.7,
  },

  dots: {
    position: "absolute",
    bottom: 80,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
