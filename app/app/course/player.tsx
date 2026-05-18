import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Video, { VideoRef } from "react-native-video";
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
  const videoRef = useRef<VideoRef>(null);

  const onExpire = () => {
    setTrialExpired(true);
    setPaused(true);
    videoRef.current?.pause();
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
              onEnd={() => {
                /* loop point — leave paused; user moves on */
              }}
              onError={() =>
                Alert.alert("Video error", "Could not load trial video.")
              }
            />
            {paused && !trialExpired ? (
              <View style={styles.playOverlay}>
                <Text style={styles.playGlyph}>▶</Text>
              </View>
            ) : null}
          </Pressable>

          <View style={{ height: Spacing.md }} />

          {!trialExpired ? (
            <>
              <CountdownTimer totalSeconds={60} remainingSeconds={60} onExpire={onExpire} />
              <View style={{ height: Spacing.md }} />
              <Text style={[Typography.caption, { color: theme.textMuted, textAlign: "center" }]}>
                Tap the video to pause · trial ends in 60 seconds
              </Text>
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
              <NuvexaButton
                label="Unlock course"
                onPress={() => router.push("/(auth)/pricing")}
              />
              <View style={{ height: Spacing.sm }} />
              <NuvexaButton label="Back to course" variant="ghost" onPress={() => router.back()} />
            </NuvexaCard>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
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
  videoSlot: {
    aspectRatio: 9 / 16,
    maxHeight: 520,
    alignSelf: "center",
    width: "100%",
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
});
