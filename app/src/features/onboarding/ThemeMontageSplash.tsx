import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { THEMES, THEME_ORDER } from "@/themes/themes";

const { width } = Dimensions.get("window");

const FLASH_MS = 560; // each verb visible for this long
const FINALE_MS = 1400; // wordmark + pulse hold

// The 5 verbs that tell the app's story — one per theme. No theme names shown.
const VERBS = ["LEARN.", "BUILD.", "SHIP.", "EARN.", "REPEAT."] as const;
const SUBTITLES = [
  "TRIAL ANY COURSE IN 60 SECONDS",
  "REAL TOOLS · REAL CODE",
  "DROP YOUR SAAS · OPEN-SOURCE FRIENDLY",
  "PASS 95% · ₹10,000 IN AI CREDITS",
  "EVERY WEEK · A NEW WIN",
] as const;

const WOOP_SOUND = require("../../../assets/sounds/cartoon.mp3");

export function ThemeMontageSplash({ onFinish }: { onFinish: () => void }) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"strobe" | "finale" | "done">("strobe");
  const soundRef = useRef<Audio.Sound | null>(null);

  const containerOpacity = useSharedValue(1);
  const slotProgress = useSharedValue(0); // 0→1 within each theme slot
  const finaleProgress = useSharedValue(0);
  const ringPulse = useSharedValue(0);

  // Play "woop" sound on mount + haptic
  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });
        const { sound } = await Audio.Sound.createAsync(WOOP_SOUND, {
          volume: 0.7,
          shouldPlay: true,
        });
        soundRef.current = sound;
      } catch {
        /* sound is non-critical */
      }
    })();

    return () => {
      soundRef.current?.unloadAsync().catch(() => undefined);
    };
  }, []);

  // STROBE PHASE — cycle through verbs (one per theme color)
  useEffect(() => {
    if (phase !== "strobe") return;

    slotProgress.value = 0;
    slotProgress.value = withTiming(1, { duration: FLASH_MS, easing: Easing.out(Easing.cubic) });

    const t = setTimeout(() => {
      Haptics.selectionAsync().catch(() => undefined);
      if (idx + 1 < VERBS.length) {
        setIdx(idx + 1);
      } else {
        setPhase("finale");
      }
    }, FLASH_MS);

    return () => clearTimeout(t);
  }, [phase, idx]);

  // FINALE — wordmark + pulsing ring
  useEffect(() => {
    if (phase !== "finale") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);

    finaleProgress.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    ringPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );

    const t = setTimeout(() => {
      containerOpacity.value = withTiming(
        0,
        { duration: 520, easing: Easing.inOut(Easing.cubic) },
        (done) => {
          if (done) runOnJS(finish)();
        },
      );
    }, FINALE_MS);

    return () => clearTimeout(t);
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
      {/* Solid base, always pure black for the finale */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: phase === "finale" ? "#000" : currentTheme.surface },
        ]}
      />

      {phase === "strobe" ? (
        <StrobeFrame theme={currentTheme} idx={idx} progress={slotProgress} />
      ) : (
        <FinaleFrame progress={finaleProgress} ringPulse={ringPulse} />
      )}

      {/* Progress strip — 5 dots */}
      <View style={styles.dots}>
        {THEME_ORDER.map((id, i) => (
          <View
            key={id}
            style={{
              width: phase === "finale" || i <= idx ? 24 : 6,
              height: 5,
              borderRadius: 3,
              marginHorizontal: 4,
              backgroundColor:
                i <= idx || phase === "finale" ? THEMES[id].primary : "rgba(255,255,255,0.18)",
              shadowColor: THEMES[id].primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: i === idx && phase === "strobe" ? 0.9 : phase === "finale" ? 0.8 : 0,
              shadowRadius: 8,
            }}
          />
        ))}
      </View>
    </Animated.View>
  );
}

// ── Strobe: big colored verb + glow + subtitle ──────────────────────────
function StrobeFrame({
  theme,
  idx,
  progress,
}: {
  theme: (typeof THEMES)[keyof typeof THEMES];
  idx: number;
  progress: { value: number };
}) {
  const verbStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.18], [0, 1], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(progress.value, [0, 0.4, 1], [0.7, 1.08, 1], Extrapolation.CLAMP) },
    ],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.35, 0.65], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0.35, 0.65], [10, 0], Extrapolation.CLAMP) },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0.35, 0.25], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0.6, 1.2], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View style={styles.frame}>
      {/* gradient glow that pulses with the verb */}
      <Animated.View style={[StyleSheet.absoluteFillObject, glowStyle]}>
        <LinearGradient
          colors={[...theme.primaryGradient, "transparent"]}
          start={{ x: 0.5, y: 0.3 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <View style={styles.center}>
        <Animated.Text
          style={[
            styles.verb,
            verbStyle,
            {
              color: theme.text,
              textShadowColor: theme.primary,
              fontStyle: theme.italicHeadlines ? "italic" : "normal",
            },
          ]}
        >
          {VERBS[idx]}
        </Animated.Text>

        <Animated.Text
          style={[
            styles.subtitle,
            subtitleStyle,
            { color: theme.primary, textShadowColor: theme.primary },
          ]}
        >
          {SUBTITLES[idx]}
        </Animated.Text>
      </View>
    </View>
  );
}

// ── Finale: clean wordmark with pulsing ring ────────────────────────────
function FinaleFrame({
  progress,
  ringPulse,
}: {
  progress: { value: number };
  ringPulse: { value: number };
}) {
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.9, 1], Extrapolation.CLAMP) }],
  }));

  const eyebrowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.4, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0.4, 1], [8, 0], Extrapolation.CLAMP) },
    ],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    opacity: interpolate(ringPulse.value, [0, 0.4, 1], [0.7, 0.3, 0], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(ringPulse.value, [0, 1], [0.9, 1.8], Extrapolation.CLAMP) },
    ],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    opacity: interpolate(ringPulse.value, [0, 0.5, 1], [0, 0.5, 0], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(ringPulse.value, [0, 1], [0.5, 1.3], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View style={styles.finale}>
      {/* Background rainbow glow — all 5 colors radial */}
      <Animated.View style={[styles.rainbowGlow, wordmarkStyle]}>
        <LinearGradient
          colors={[
            "transparent",
            "#00E37822",
            "#FFD93022",
            "#FFB22433",
            "#FF3D9322",
            "#7C4DFF22",
            "transparent",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: width * 1.5, height: 240 }}
        />
      </Animated.View>

      {/* Pulsing rings */}
      <Animated.View style={[styles.ring, ring1Style]} />
      <Animated.View style={[styles.ring, ring2Style]} />

      <Animated.View style={[styles.coreContainer, wordmarkStyle]}>
        {/* Single big rainbow N */}
        <RainbowN size={130} />
        <Text style={styles.wordmark}>
          nuvexa<Text style={styles.wordmarkSub}>.learning</Text>
        </Text>
      </Animated.View>

      <Animated.Text style={[styles.eyebrowFinale, eyebrowStyle]}>
        $ AI · BUILT BY BUILDERS
      </Animated.Text>
    </View>
  );
}

function RainbowN({ size }: { size: number }) {
  // Rainbow effect via 5 stacked Ns, each clipped to a horizontal slice via mask-emulation
  // Simpler approach: a single white N with a rainbow gradient layered behind for glow
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <LinearGradient
        colors={["#00E378", "#FFD930", "#FFB224", "#FF3D93", "#7C4DFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          width: size * 1.4,
          height: size * 1.4,
          borderRadius: size,
          opacity: 0.25,
        }}
      />
      <Svg width={size} height={size} viewBox="-120 -120 240 240">
        <Path
          d="M -90 120 L -90 -120 L -45 -120 L 65 105 L 65 -120 L 110 -120 L 110 120 L 65 120 L -45 -85 L -45 120 Z"
          fill="#FFFFFF"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: "center", justifyContent: "center", zIndex: 1000 },
  frame: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },

  verb: {
    fontSize: 84,
    fontWeight: "900",
    letterSpacing: -3,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 28,
  },
  subtitle: {
    marginTop: 18,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2.4,
    fontFamily: "Menlo",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    textAlign: "center",
  },

  finale: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  rainbowGlow: { position: "absolute", alignItems: "center", justifyContent: "center" },
  ring: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  coreContainer: { alignItems: "center", justifyContent: "center", gap: 18 },
  wordmark: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  wordmarkSub: { color: "#888", fontWeight: "500" },
  eyebrowFinale: {
    position: "absolute",
    bottom: 140,
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
    fontFamily: "Menlo",
    opacity: 0.6,
  },

  dots: {
    position: "absolute",
    bottom: 60,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
