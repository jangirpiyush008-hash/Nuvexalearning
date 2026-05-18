import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

// Cosmic glass background: deep blue + aurora gradient sweep + twinkling stars
// + floating iridescent orbs. The orbs move slowly.
export function GlassBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* cosmic vertical gradient */}
      <LinearGradient
        colors={["#06091A", "#0A1240", "#06091A"]}
        style={StyleSheet.absoluteFill}
      />

      {/* aurora sweep */}
      <LinearGradient
        colors={["#A0E9FF22", "#9C8CFF22", "#FF9CC222"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { opacity: 0.7 }]}
      />

      {/* twinkling stars */}
      <View style={StyleSheet.absoluteFill}>
        {STARS.map((s, i) => (
          <Star key={i} {...s} />
        ))}
      </View>

      {/* iridescent floating orbs */}
      <FloatingOrb top={"15%"} left={"-12%"} hue="#A0E9FF" size={220} />
      <FloatingOrb top={"55%"} left={"70%"} hue="#FF9CC2" size={180} delay={2000} />
      <FloatingOrb top={"78%"} left={"-8%"} hue="#9C8CFF" size={160} delay={4000} />
    </View>
  );
}

const STARS = Array.from({ length: 80 }, () => ({
  top: Math.random() * 100,
  left: Math.random() * 100,
  size: 1 + Math.random() * 1.5,
  delay: Math.floor(Math.random() * 2500),
}));

function Star({ top, left, size, delay }: { top: number; left: number; size: number; delay: number }) {
  const opacity = useSharedValue(0.2);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 1500 + delay, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.2, { duration: 1500 + delay, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: `${top}%` as any,
          left: `${left}%` as any,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#FFFFFF",
        },
        style,
      ]}
    />
  );
}

function FloatingOrb({
  top,
  left,
  hue,
  size,
  delay = 0,
}: {
  top: string;
  left: string;
  hue: string;
  size: number;
  delay?: number;
}) {
  const ty = useSharedValue(0);
  useEffect(() => {
    ty.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 4000 + delay, easing: Easing.inOut(Easing.sin) }),
        withTiming(-20, { duration: 4000 + delay, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: top as any,
          left: left as any,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: hue,
          opacity: 0.32,
          shadowColor: hue,
          shadowOpacity: 0.7,
          shadowRadius: size * 0.6,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    />
  );
}
