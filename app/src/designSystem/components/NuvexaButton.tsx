import React from "react";
import { Pressable, Text, StyleSheet, View, ActivityIndicator, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { Spacing, Typography } from "..";
import { useTheme } from "@/themes/ThemeProvider";

type Variant = "primary" | "secondary" | "ghost" | "reward" | "insta";

export function NuvexaButton({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
  fullWidth = true,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const overlay = useSharedValue(0);

  const handle = () => {
    if (loading || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };
  const onIn = () => {
    scale.value = withSpring(0.96, { stiffness: 320, damping: 18 });
    overlay.value = withTiming(0.18, { duration: 80 });
  };
  const onOut = () => {
    scale.value = withSpring(1, { stiffness: 240, damping: 16 });
    overlay.value = withTiming(0, { duration: 180 });
  };

  const wrapperAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.45 : 1,
  }));
  const overlayAnim = useAnimatedStyle(() => ({ opacity: overlay.value }));

  const wrapperStyle: ViewStyle = { width: fullWidth ? "100%" : undefined, ...style };

  const baseShape = {
    borderRadius: theme.btnRadius,
    height: theme.btnRadius === 0 ? 48 : 52,
  };

  const labelStyle = {
    textTransform: theme.uppercase ? ("uppercase" as const) : ("none" as const),
    fontStyle: theme.italicHeadlines ? ("italic" as const) : ("normal" as const),
    fontWeight: theme.displayWeight,
  };

  if (variant === "primary") {
    return (
      <Pressable onPress={handle} onPressIn={onIn} onPressOut={onOut} disabled={loading || disabled} style={wrapperStyle}>
        <Animated.View
          style={[
            {
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.55,
              shadowRadius: 24,
              elevation: 12,
            },
            wrapperAnim,
          ]}
        >
          <LinearGradient
            colors={[...theme.primaryGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.base, baseShape, theme.effects.pixelGrid && { borderWidth: 2, borderColor: "#000" }]}
          >
            {loading ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <Text style={[styles.label, { color: theme.onPrimary }, labelStyle]}>{label}</Text>
            )}
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: "#FFFFFF" }, overlayAnim]} />
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  if (variant === "reward") {
    return (
      <Pressable onPress={handle} onPressIn={onIn} onPressOut={onOut} disabled={loading || disabled} style={wrapperStyle}>
        <Animated.View
          style={[
            {
              shadowColor: theme.reward,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.7,
              shadowRadius: 32,
              elevation: 14,
            },
            wrapperAnim,
          ]}
        >
          <LinearGradient
            colors={[theme.reward, "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.base, baseShape]}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={[styles.label, { color: "#000" }, labelStyle]}>{label}</Text>
            )}
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: "#000" }, overlayAnim]} />
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  if (variant === "insta") {
    return (
      <Pressable onPress={handle} onPressIn={onIn} onPressOut={onOut} disabled={loading || disabled} style={wrapperStyle}>
        <Animated.View
          style={[
            {
              shadowColor: "#DD2A7B",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.55,
              shadowRadius: 24,
              elevation: 12,
            },
            wrapperAnim,
          ]}
        >
          <LinearGradient
            colors={["#F58529", "#DD2A7B", "#8134AF", "#515BD4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.base, baseShape]}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[styles.label, { color: "#FFFFFF" }, labelStyle]}>{label}</Text>}
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: "#FFF" }, overlayAnim]} />
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  if (variant === "secondary") {
    return (
      <Pressable onPress={handle} onPressIn={onIn} onPressOut={onOut} disabled={loading || disabled} style={wrapperStyle}>
        <Animated.View
          style={[
            styles.base,
            baseShape,
            {
              backgroundColor: theme.surfaceElevated,
              borderWidth: theme.effects.pixelGrid ? 2 : 1,
              borderColor: theme.border,
            },
            wrapperAnim,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={theme.text} />
          ) : (
            <Text style={[styles.label, { color: theme.text }, labelStyle]}>{label}</Text>
          )}
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: "#FFF", borderRadius: theme.btnRadius }, overlayAnim]} />
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handle} onPressIn={onIn} onPressOut={onOut} disabled={loading || disabled} style={wrapperStyle}>
      <Animated.View style={[styles.base, baseShape, { backgroundColor: "transparent" }, wrapperAnim]}>
        {loading ? (
          <ActivityIndicator color={theme.text} />
        ) : (
          <Text style={[styles.label, { color: theme.textSubtle }, labelStyle]}>{label}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  label: { ...Typography.titleS, letterSpacing: 0.2 },
});
