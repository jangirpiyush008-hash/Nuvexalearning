import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { NeonN, Typography } from "@/designSystem";
import { useTheme } from "@/themes/ThemeProvider";
import { MatrixRain } from "@/themes/decorations/MatrixRain";
import { MarvelBackground } from "@/themes/decorations/MarvelBackground";
import { SynthwaveBackground } from "@/themes/decorations/SynthwaveBackground";
import { GlassBackground } from "@/themes/decorations/GlassBackground";
import { playSplashSoundFor, stopSplashSound } from "@/themes/audio/ThemeAudio";

const { width } = Dimensions.get("window");

// One splash, theme-aware. Animations + decorations swap by theme.id.
export function AnimatedSplash({
  onFinish,
  onReady,
}: {
  onFinish: () => void;
  onReady?: () => void;
}) {
  const { theme } = useTheme();

  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Signal that the animated splash has its first frame mounted; the
    // native splash can drop now for a seamless handoff.
    onReady?.();

    // theme-specific splash sound (no-op if file/url not configured)
    playSplashSoundFor(theme.id);

    containerOpacity.value = withDelay(
      2800,
      withTiming(0, { duration: 450, easing: Easing.inOut(Easing.cubic) }, (done) => {
        if (done) runOnJS(onFinish)();
      }),
    );

    return () => {
      stopSplashSound();
    };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, { backgroundColor: theme.surface }, containerStyle]}
      pointerEvents="none"
    >
      {theme.id === "neon-os" && <NeonSplash />}
      {theme.id === "cartoon" && <CartoonSplash />}
      {theme.id === "marvel" && <MarvelSplash />}
      {theme.id === "retro-90s" && <RetroSplash />}
      {theme.id === "glass-3d" && <GlassSplash />}
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// NEON OS — Matrix rain + N pop + terminal cursor
// ─────────────────────────────────────────────────────────────────────────
function NeonSplash() {
  const { theme } = useTheme();
  // Start scale=1 / opacity=1 so the N is already on-screen at first paint —
  // matches what iOS just showed via the native splash. No flicker.
  const nScale = useSharedValue(1);
  const nOpacity = useSharedValue(1);
  const [frame, setFrame] = useState(0);
  const frames = ["$ BOOT_KERNEL_", "$ LOADING_AI..", "$ MOUNT_VOICES.", "$ READY"];

  useEffect(() => {
    // Small "breath" animation after handoff — looks alive without dropping in.
    nScale.value = withSequence(
      withTiming(1.08, { duration: 380, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: 260 }),
    );
    const iv = setInterval(() => {
      setFrame((f) => (f + 1 < frames.length ? f + 1 : frames.length - 1));
    }, 500);
    return () => clearInterval(iv);
  }, []);

  const nStyle = useAnimatedStyle(() => ({
    opacity: nOpacity.value,
    transform: [{ scale: nScale.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <MatrixRain />
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Animated.View style={nStyle}>
          <NeonN size={140} />
        </Animated.View>
        <Text style={[styles.wordmark, { color: theme.text }]}>
          nuvexa<Text style={{ color: theme.textMuted, fontWeight: "500" }}>.learning</Text>
        </Text>
        <Text style={[styles.terminal, { color: theme.primary, textShadowColor: theme.primary }]}>
          {frames[frame]}
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CARTOON POP — bouncing N + POW! burst → "READY TO SHIP?"
// ─────────────────────────────────────────────────────────────────────────
function CartoonSplash() {
  const { theme } = useTheme();
  const nScale = useSharedValue(0);
  const nRotate = useSharedValue(-30);
  const burstScale = useSharedValue(0);
  const titleOp = useSharedValue(0);

  useEffect(() => {
    nScale.value = withSequence(
      withTiming(1.3, { duration: 400, easing: Easing.out(Easing.back(2)) }),
      withTiming(1.0, { duration: 250 }),
    );
    nRotate.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    burstScale.value = withDelay(
      450,
      withSequence(
        withTiming(1.1, { duration: 280, easing: Easing.out(Easing.back(3)) }),
        withTiming(1.0, { duration: 200 }),
      ),
    );
    titleOp.value = withDelay(900, withTiming(1, { duration: 400 }));
  }, []);

  const nStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nScale.value }, { rotateZ: `${nRotate.value}deg` }],
  }));
  const burstStyle = useAnimatedStyle(() => ({ transform: [{ scale: burstScale.value }] }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOp.value }));

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.surface }]}>
      {/* halftone dots */}
      <View style={StyleSheet.absoluteFill}>
        {Array.from({ length: 18 }).flatMap((_, row) =>
          Array.from({ length: 12 }).map((_, col) => (
            <View
              key={`${row}-${col}`}
              style={{
                position: "absolute",
                top: `${(row * 100) / 18}%` as any,
                left: `${(col * 100) / 12}%` as any,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#0F0F0F",
                opacity: row % 2 === col % 2 ? 0.1 : 0,
              }}
            />
          )),
        )}
      </View>

      <View style={[StyleSheet.absoluteFill, styles.center]}>
        {/* POW burst behind N */}
        <Animated.View style={[styles.cartoonBurst, burstStyle]}>
          <View style={[styles.cartoonBurstShape, { backgroundColor: "#FFE600" }]} />
          <Text style={styles.cartoonPow}>POW!</Text>
        </Animated.View>

        <Animated.View style={nStyle}>
          <NeonN size={130} />
        </Animated.View>

        <Animated.Text
          style={[
            styles.cartoonTitle,
            { color: theme.text },
            titleStyle,
          ]}
        >
          READY TO SHIP?
        </Animated.Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MARVEL — cinematic zoom-in + red flare + italic uppercase title card
// ─────────────────────────────────────────────────────────────────────────
function MarvelSplash() {
  const { theme } = useTheme();
  const flareScale = useSharedValue(0.3);
  const flareOp = useSharedValue(0);
  const nOp = useSharedValue(0);
  const nScale = useSharedValue(2.2);
  const titleOp = useSharedValue(0);
  const subOp = useSharedValue(0);

  useEffect(() => {
    flareOp.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(200, withTiming(0.25, { duration: 600 })),
    );
    flareScale.value = withTiming(2.4, { duration: 1100, easing: Easing.out(Easing.cubic) });
    nOp.value = withDelay(350, withTiming(1, { duration: 350 }));
    nScale.value = withDelay(350, withTiming(1.0, { duration: 750, easing: Easing.out(Easing.cubic) }));
    titleOp.value = withDelay(950, withTiming(1, { duration: 350 }));
    subOp.value = withDelay(1350, withTiming(1, { duration: 350 }));
  }, []);

  const flareStyle = useAnimatedStyle(() => ({
    opacity: flareOp.value,
    transform: [{ scale: flareScale.value }],
  }));
  const nStyle = useAnimatedStyle(() => ({
    opacity: nOp.value,
    transform: [{ scale: nScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOp.value }));
  const subStyle = useAnimatedStyle(() => ({ opacity: subOp.value }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <MarvelBackground />
      {/* center flare */}
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Animated.View style={[styles.marvelFlare, flareStyle]} />
      </View>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Animated.View style={nStyle}>
          <NeonN size={150} />
        </Animated.View>
        <Animated.Text style={[styles.marvelTitle, { color: theme.text }, titleStyle]}>
          NUVEXA
        </Animated.Text>
        <Animated.Text
          style={[
            styles.marvelSub,
            { color: theme.accent1, textShadowColor: theme.accent1 },
            subStyle,
          ]}
        >
          $ LEARNING · ASSEMBLE
        </Animated.Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// RETRO 90s — Win95 boot screen, BIOS text scrolling, then "C:\WELCOME loaded"
// ─────────────────────────────────────────────────────────────────────────
// RETRO MODERN — synthwave horizon reveal + chrome title
function RetroSplash() {
  const { theme } = useTheme();
  const titleOp = useSharedValue(0);
  const titleScale = useSharedValue(0.6);
  const subOp = useSharedValue(0);

  useEffect(() => {
    titleOp.value = withTiming(1, { duration: 600 });
    titleScale.value = withSequence(
      withTiming(1.08, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: 300 }),
    );
    subOp.value = withDelay(700, withTiming(1, { duration: 400 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOp.value,
    transform: [{ scale: titleScale.value }],
  }));
  const subStyle = useAnimatedStyle(() => ({ opacity: subOp.value }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <SynthwaveBackground />
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Animated.Text style={[styles.retroTitleMega, titleStyle]}>NUVEXA</Animated.Text>
        <Animated.Text style={[styles.retroSubMega, subStyle]}>$ LEARNING · 1986</Animated.Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// GLASS 3D — starfield zoom + glass orb formation + ultralight wordmark
// ─────────────────────────────────────────────────────────────────────────
function GlassSplash() {
  const { theme } = useTheme();
  const orbScale = useSharedValue(0);
  const orbRotate = useSharedValue(0);
  const wordOp = useSharedValue(0);
  const wordTranslate = useSharedValue(20);
  const subOp = useSharedValue(0);

  useEffect(() => {
    orbScale.value = withSequence(
      withTiming(1.1, { duration: 700, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: 250 }),
    );
    orbRotate.value = withRepeat(withTiming(360, { duration: 8000, easing: Easing.linear }), -1, false);
    wordOp.value = withDelay(700, withTiming(1, { duration: 500 }));
    wordTranslate.value = withDelay(700, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    subOp.value = withDelay(1200, withTiming(1, { duration: 400 }));
  }, []);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }, { rotateZ: `${orbRotate.value}deg` }],
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOp.value,
    transform: [{ translateY: wordTranslate.value }],
  }));
  const subStyle = useAnimatedStyle(() => ({ opacity: subOp.value }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <GlassBackground />
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Animated.View style={[styles.glassOrb, orbStyle]}>
          <LinearGradient
            colors={[...theme.primaryGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 100 }]}
          />
          <View style={styles.glassSpec} />
        </Animated.View>
        <Animated.Text style={[styles.glassWord, { color: theme.text }, wordStyle]}>
          nuvexa
        </Animated.Text>
        <Animated.Text style={[styles.glassSub, { color: theme.textSubtle }, subStyle]}>
          frosted · iridescent · floating
        </Animated.Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { alignItems: "center", justifyContent: "center", zIndex: 999, overflow: "hidden" },
  center: { alignItems: "center", justifyContent: "center" },

  // Neon
  wordmark: { marginTop: 28, fontSize: 28, fontWeight: "700", letterSpacing: -0.6 },
  terminal: {
    marginTop: 22,
    ...Typography.terminal,
    fontSize: 12,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Cartoon
  cartoonBurst: {
    position: "absolute",
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  cartoonBurstShape: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 4,
    borderColor: "#000",
    opacity: 0.7,
  },
  cartoonPow: {
    position: "absolute",
    top: -30,
    right: -20,
    fontSize: 56,
    fontWeight: "900",
    color: "#FF1493",
    transform: [{ rotate: "12deg" }],
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  cartoonTitle: {
    marginTop: 28,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },

  // Marvel
  marvelFlare: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FFB400",
    shadowColor: "#E62429",
    shadowOpacity: 0.9,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 0 },
  },
  marvelTitle: {
    marginTop: 28,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 8,
    fontStyle: "italic",
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  marvelSub: {
    marginTop: 10,
    ...Typography.terminal,
    fontSize: 12,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Retro
  retroTitleMega: {
    fontSize: 64,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 6,
    textShadowColor: "#FF3DC4",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  retroSubMega: {
    marginTop: 14,
    color: "#00D9FF",
    fontFamily: "Menlo",
    fontSize: 14,
    letterSpacing: 4,
    textShadowColor: "#00D9FF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Glass
  glassOrb: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: "hidden",
    shadowColor: "#A0E9FF",
    shadowOpacity: 0.7,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 0 },
  },
  glassSpec: {
    position: "absolute",
    top: 14,
    left: 24,
    width: 50,
    height: 30,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.55)",
    transform: [{ rotate: "-25deg" }],
  },
  glassWord: {
    marginTop: 32,
    fontSize: 38,
    fontWeight: "200",
    letterSpacing: -1,
  },
  glassSub: { marginTop: 10, fontSize: 13, letterSpacing: 1.2 },
});
