import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Video, { VideoRef } from "react-native-video";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import {
  CountdownTimer,
  NuvexaButton,
  NuvexaCard,
  Spacing,
  TerminalLabel,
  Typography,
} from "@/designSystem";
import { useTheme } from "@/themes/ThemeProvider";

const TRIAL_VIDEO = require("../../assets/videos/trial.mp4");

export default function Player() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const [trialExpired, setTrialExpired] = useState(false);
  const [paused, setPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(2_847);
  const videoRef = useRef<VideoRef>(null);

  const onExpire = () => {
    setTrialExpired(true);
    setPaused(true);
    videoRef.current?.pause();
  };

  const onLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked((l) => {
      setLikeCount((c) => c + (l ? -1 : 1));
      return !l;
    });
  };
  const onBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBookmarked((b) => !b);
  };
  const onShare = async () => {
    Haptics.selectionAsync();
    try {
      await Share.share({
        title: "Nuvexa Learning",
        message: "Check out this AI course on Nuvexa Learning · https://nuvexa.app",
      });
    } catch {
      /* swallow */
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={[Typography.terminal, { color: theme.textSubtle, fontSize: 12 }]}>← back</Text>
          </Pressable>
          <TerminalLabel>PLAYER · TRIAL</TerminalLabel>
        </View>

        <View style={styles.body}>
          <View style={styles.videoArea}>
            <Pressable
              onPress={() => {
                if (trialExpired) return;
                setPaused((p) => !p);
              }}
              style={[
                styles.videoSlot,
                {
                  backgroundColor: "#000",
                  borderRadius: theme.btnRadius,
                  borderColor: theme.border,
                  borderWidth: theme.effects.pixelGrid ? 2 : 1,
                },
              ]}
            >
              <Video
                ref={videoRef}
                source={TRIAL_VIDEO}
                style={StyleSheet.absoluteFill}
                resizeMode="contain"
                paused={paused || trialExpired}
                repeat={false}
                muted={false}
                onError={() => Alert.alert("Video error", "Could not load trial video.")}
              />
              {paused && !trialExpired ? (
                <View style={styles.playOverlay}>
                  <Text style={styles.playGlyph}>▶</Text>
                </View>
              ) : null}

              {/* Lesson title pill — top */}
              <View style={styles.titlePill}>
                <Text style={styles.titlePillText} numberOfLines={1}>
                  Lesson 01 · Why prompt engineering still matters
                </Text>
              </View>

              {/* View count — top-right */}
              <View style={styles.viewsPill}>
                <Text style={styles.viewsGlyph}>👁</Text>
                <Text style={styles.viewsText}>12.4K</Text>
              </View>
            </Pressable>

            {/* Vertical action stack — right side */}
            <View style={styles.actionStack}>
              <ActionBtn
                glyph={liked ? "♥" : "♡"}
                label={formatCount(likeCount)}
                active={liked}
                onPress={onLike}
                color={liked ? "#FF3B5C" : "#FFFFFF"}
              />
              <ActionBtn glyph="↗" label="Share" onPress={onShare} color="#FFFFFF" />
              <ActionBtn
                glyph={bookmarked ? "🔖" : "📑"}
                label="Save"
                active={bookmarked}
                onPress={onBookmark}
                color={bookmarked ? theme.primary : "#FFFFFF"}
              />
              <ActionBtn
                glyph="💬"
                label="Voices"
                onPress={() => router.push("/(tabs)/voices")}
                color="#FFFFFF"
              />
            </View>
          </View>

          <View style={{ height: Spacing.md }} />

          {!trialExpired ? (
            <>
              <CountdownTimer totalSeconds={60} remainingSeconds={60} onExpire={onExpire} />
              <View style={{ height: Spacing.sm }} />
              <View style={styles.lessonNavRow}>
                <Pressable
                  onPress={() => Alert.alert("Previous lesson", "Demo · would navigate to prior lesson.")}
                  style={[styles.lessonNavBtn, { borderColor: theme.border }]}
                >
                  <Text style={[Typography.terminal, { color: theme.textSubtle, fontSize: 11 }]}>← prev</Text>
                </Pressable>
                <Text style={[Typography.caption, { color: theme.textMuted, flex: 1, textAlign: "center" }]}>
                  Tap video to pause · trial ends in 60s
                </Text>
                <Pressable
                  onPress={() => Alert.alert("Next lesson", "Demo · would navigate to next lesson.")}
                  style={[styles.lessonNavBtn, { borderColor: theme.primary, shadowColor: theme.primary }]}
                >
                  <Text style={[Typography.terminal, { color: theme.primary, fontSize: 11 }]}>next →</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <NuvexaCard>
              <TerminalLabel>TRIAL_ENDED</TerminalLabel>
              <Text
                style={{
                  ...Typography.titleM,
                  color: theme.text,
                  marginTop: Spacing.sm,
                  fontWeight: theme.displayWeight,
                  textTransform: theme.uppercase ? "uppercase" : "none",
                  fontStyle: theme.italicHeadlines ? "italic" : "normal",
                }}
              >
                You're hooked. Now finish.
              </Text>
              <Text style={[Typography.body, { color: theme.textSubtle, marginTop: Spacing.sm }]}>
                Unlock the full course to keep watching, grab the PDFs, take the final test, and earn AI Credits.
              </Text>
              <View style={{ height: Spacing.lg }} />
              <NuvexaButton label="Unlock course" onPress={() => router.push("/(auth)/pricing")} />
              <View style={{ height: Spacing.sm }} />
              <NuvexaButton label="Back to course" variant="ghost" onPress={() => router.back()} />
            </NuvexaCard>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function ActionBtn({
  glyph,
  label,
  onPress,
  active,
  color,
}: {
  glyph: string;
  label: string;
  onPress: () => void;
  active?: boolean;
  color: string;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPressIn={() => (scale.value = withSpring(0.85, { stiffness: 400, damping: 12 }))}
      onPressOut={() => (scale.value = withSpring(1, { stiffness: 300, damping: 14 }))}
      onPress={onPress}
      style={styles.actionBtn}
    >
      <Animated.Text style={[styles.actionGlyph, { color }, style]}>{glyph}</Animated.Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.xl },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  body: { flex: 1 },
  videoArea: { flexDirection: "row", alignItems: "flex-end", gap: Spacing.md },
  videoSlot: {
    flex: 1,
    aspectRatio: 9 / 16,
    maxHeight: 540,
    overflow: "hidden",
    position: "relative",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  playGlyph: { color: "#FFFFFF", fontSize: 48, marginLeft: 6 },

  titlePill: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 56,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  titlePillText: { color: "#FFFFFF", fontSize: 11, fontWeight: "600" },

  viewsPill: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
    gap: 4,
  },
  viewsGlyph: { fontSize: 12 },
  viewsText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },

  actionStack: {
    width: 50,
    alignItems: "center",
    paddingBottom: 8,
    gap: 14,
  },
  actionBtn: { alignItems: "center" },
  actionGlyph: {
    fontSize: 30,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  lessonNavRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  lessonNavBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 999,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});
