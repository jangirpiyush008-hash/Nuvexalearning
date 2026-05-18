import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import {
  NuvexaButton,
  NuvexaCard,
  Spacing,
  TerminalLabel,
  Typography,
} from "@/designSystem";
import { useTheme } from "@/themes/ThemeProvider";
import { todaysSprint } from "@/features/sprint/sprintData";

type Stage = "read" | "quiz" | "result";

export default function SprintScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const sprint = todaysSprint();
  const [stage, setStage] = useState<Stage>("read");
  const [picked, setPicked] = useState<number | null>(null);

  const correct = picked === sprint.question.correct;

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={[Typography.terminal, { color: theme.textSubtle, fontSize: 12 }]}>← exit</Text>
            </Pressable>
            <TerminalLabel>DAILY_SPRINT</TerminalLabel>
          </View>

          {stage === "read" && (
            <Animated.View entering={FadeIn.duration(350)}>
              <Text style={[styles.topic, { color: theme.primary, textShadowColor: theme.primary }]}>
                $ {sprint.topic}
              </Text>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 26,
                  fontWeight: theme.displayWeight,
                  marginTop: 8,
                  letterSpacing: -0.4,
                  textTransform: theme.uppercase ? "uppercase" : "none",
                  fontStyle: theme.italicHeadlines ? "italic" : "normal",
                }}
              >
                {sprint.title}
              </Text>
              <NuvexaCard style={{ marginTop: Spacing.lg }}>
                <Text style={[Typography.body, { color: theme.text, lineHeight: 24 }]}>
                  {sprint.body}
                </Text>
              </NuvexaCard>
              <View style={{ height: Spacing.xl }} />
              <NuvexaButton label="Take the question →" onPress={() => setStage("quiz")} />
            </Animated.View>
          )}

          {stage === "quiz" && (
            <Animated.View entering={FadeInDown.duration(350)}>
              <TerminalLabel>QUICK_CHECK</TerminalLabel>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 22,
                  fontWeight: theme.displayWeight,
                  marginTop: 8,
                  letterSpacing: -0.3,
                }}
              >
                {sprint.question.prompt}
              </Text>
              <View style={{ marginTop: Spacing.lg }}>
                {sprint.question.options.map((opt, i) => {
                  const isPicked = picked === i;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => setPicked(i)}
                      style={[
                        styles.opt,
                        {
                          backgroundColor: theme.surfaceCard,
                          borderRadius: theme.cardRadius,
                          borderColor: isPicked ? theme.primary : theme.border,
                          borderWidth: isPicked ? 2 : 1,
                        },
                      ]}
                    >
                      <Text style={[styles.optLetter, { color: theme.primary }]}>
                        {String.fromCharCode(65 + i)}
                      </Text>
                      <Text style={[Typography.body, { color: theme.text, flex: 1 }]}>{opt}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ height: Spacing.xl }} />
              <NuvexaButton
                label="Submit"
                disabled={picked === null}
                onPress={() => setStage("result")}
              />
            </Animated.View>
          )}

          {stage === "result" && (
            <Animated.View entering={FadeInDown.duration(400)}>
              <View
                style={[
                  styles.result,
                  {
                    backgroundColor: theme.surfaceCard,
                    borderRadius: theme.cardRadius,
                    borderColor: correct ? theme.primary : theme.danger,
                    shadowColor: correct ? theme.primary : theme.danger,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.resultBig,
                    {
                      color: correct ? theme.primary : theme.danger,
                      textShadowColor: correct ? theme.primary : theme.danger,
                    },
                  ]}
                >
                  {correct ? "+1 STREAK" : "−1 STREAK"}
                </Text>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 22,
                    fontWeight: theme.displayWeight,
                    marginTop: Spacing.sm,
                  }}
                >
                  {correct ? "Nice. You're on fire." : "Not quite. Read the explanation."}
                </Text>
                <View style={[styles.explain, { borderTopColor: theme.border }]}>
                  <Text style={[Typography.caption, { color: theme.textMuted, marginBottom: 4 }]}>
                    Answer: {sprint.question.options[sprint.question.correct]}
                  </Text>
                  <Text style={[Typography.bodyS, { color: theme.textSubtle }]}>
                    Come back tomorrow for the next sprint. Streak grows · credits compound.
                  </Text>
                </View>
              </View>
              <View style={{ height: Spacing.xl }} />
              <NuvexaButton label="Done" onPress={() => router.back()} />
              <View style={{ height: Spacing.sm }} />
              <NuvexaButton
                label="Share to Voices"
                variant="ghost"
                onPress={() => Alert.alert("Share", "Shared to Voices (demo).")}
              />
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topic: {
    ...Typography.terminal,
    fontSize: 11,
    marginTop: Spacing.lg,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  opt: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  optLetter: {
    ...Typography.mono,
    fontSize: 16,
    fontWeight: "800",
    width: 28,
  },
  result: {
    padding: Spacing.xl,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  resultBig: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -0.8,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  explain: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
});
