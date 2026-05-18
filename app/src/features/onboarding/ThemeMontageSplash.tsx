import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { SecureStorage } from "@/core/storage/secureStore";
import { THEMES, THEME_ORDER } from "@/themes/themes";

const { width, height } = Dimensions.get("window");
const FLAG_KEY = "nuvexa.firstLaunch.done";

const FLASH_MS = 220;          // each theme card visible for this long
const STATIC_MS = 800;          // final hold on "ALL THEMES" composite before fade

/**
 * First-launch only. Cycles through all 5 themes rapidly (color, decoration,
 * logo, name) like a strobe-montage. Stores a flag so it never plays again.
 *
 * If the flag exists, calls onFinish() immediately so the parent can skip to
 * the regular AnimatedSplash without delay.
 */
export function ThemeMontageSplash({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<"checking" | "playing" | "done">("checking");
  const [idx, setIdx] = useState(0);
  const containerOpacity = useSharedValue(1);

  // Check first-launch flag
  useEffect(() => {
    SecureStorage.get(FLAG_KEY)
      .then((v) => {
        if (v === "1") {
          // already shown before — skip entirely
          setPhase("done");
          onFinish();
        } else {
          setPhase("playing");
        }
      })
      .catch(() => {
        setPhase("playing");
      });
  }, []);

  // Drive the strobe cycle
  useEffect(() => {
    if (phase !== "playing") return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    const iv = setInterval(() => {
      setIdx((i) => {
        const next = i + 1;
        if (next < THEME_ORDER.length) {
          // light haptic for each flash
          Haptics.selectionAsync().catch(() => undefined);
          return next;
        }
        return i;
      });
    }, FLASH_MS);

    // After all themes shown + static hold, fade out
    const totalMs = THEME_ORDER.length * FLASH_MS + STATIC_MS;
    const t = setTimeout(() => {
      containerOpacity.value = withTiming(
        0,
        { duration: 380, easing: Easing.inOut(Easing.cubic) },
        (done) => {
          if (done) {
            runOnJS(markDone)();
          }
        },
      );
    }, totalMs);

    return () => {
      clearInterval(iv);
      clearTimeout(t);
    };
  }, [phase]);

  const markDone = async () => {
    try {
      await SecureStorage.set(FLAG_KEY, "1");
    } catch {
      /* swallow */
    }
    onFinish();
  };

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));

  if (phase === "checking" || phase === "done") return null;

  const currentTheme = THEMES[THEME_ORDER[Math.min(idx, THEME_ORDER.length - 1)]];
  const isFinal = idx >= THEME_ORDER.length - 1;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, { backgroundColor: currentTheme.surface }, containerStyle]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={[...currentTheme.primaryGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { opacity: 0.18 }]}
      />

      <View style={styles.center}>
        <Flash key={`n-${idx}`} color={currentTheme.primary} />
        <Text
          key={`label-${idx}`}
          style={[
            styles.name,
            {
              color: currentTheme.text,
              fontWeight: currentTheme.displayWeight,
              textTransform: currentTheme.uppercase ? "uppercase" : "none",
              fontStyle: currentTheme.italicHeadlines ? "italic" : "normal",
            },
          ]}
        >
          {currentTheme.name}
        </Text>
        <Text style={[styles.eyebrow, { color: currentTheme.primary, textShadowColor: currentTheme.primary }]}>
          $ {isFinal ? "PICK_YOUR_VIBE" : `THEME_${idx + 1}_OF_${THEME_ORDER.length}`}
        </Text>
      </View>

      {/* Progress strip at the bottom */}
      <View style={styles.dots}>
        {THEME_ORDER.map((id, i) => (
          <View
            key={id}
            style={{
              width: i <= idx ? 20 : 6,
              height: 6,
              borderRadius: 3,
              marginHorizontal: 3,
              backgroundColor: i <= idx ? currentTheme.primary : "rgba(255,255,255,0.2)",
              shadowColor: currentTheme.primary,
              shadowOpacity: i === idx ? 0.7 : 0,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 0 },
            }}
          />
        ))}
      </View>
    </Animated.View>
  );
}

// Single N flash element with a tiny scale-in bounce per mount
function Flash({ color }: { color: string }) {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);
  useEffect(() => {
    scale.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 120 });
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={[style, { width: 200, height: 200, alignItems: "center", justifyContent: "center" }]}>
      <View
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: color,
          opacity: 0.18,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 60,
        }}
      />
      <Svg width={160} height={160} viewBox="-120 -120 240 240">
        <Path
          d="M -90 120 L -90 -120 L -45 -120 L 65 105 L 65 -120 L 110 -120 L 110 120 L 65 120 L -45 -85 L -45 120 Z"
          fill={color}
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: "center", justifyContent: "center", zIndex: 1000 },
  center: { alignItems: "center", justifyContent: "center" },
  name: {
    marginTop: 16,
    fontSize: 32,
    letterSpacing: -0.6,
  },
  eyebrow: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    fontFamily: "Menlo",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  dots: {
    position: "absolute",
    bottom: 60,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
  },
});
