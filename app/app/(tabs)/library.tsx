import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { resolveThumbnail } from "@/core/thumbnails";
import {
  GradientChip,
  GradientProgressRing,
  NuvexaCard,
  Spacing,
  TerminalLabel,
  Typography,
} from "@/designSystem";
import { DEMO_COURSES } from "@/core/demoData";
import { useAuth } from "@/features/auth/AuthProvider";
import { useTheme } from "@/themes/ThemeProvider";
import { ThemeOverlay } from "@/themes/ThemeOverlay";
import { SkillTree } from "@/features/skillTree/SkillTree";
import { CardDeck } from "@/features/knowledgeCards/CardDeck";

type Tab = "courses" | "tree" | "cards";

export default function Library() {
  const router = useRouter();
  const { isDemo } = useAuth();
  const { theme } = useTheme();
  const [tab, setTab] = useState<Tab>("courses");

  const enrolled = isDemo
    ? DEMO_COURSES.map((c, i) => ({ course: c, pct: [42, 18, 75][i] ?? 0 }))
    : [];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.surface }]}>
      <ThemeOverlay />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TerminalLabel>LIBRARY · MY_LEARNING</TerminalLabel>
        <Text
          style={{
            ...Typography.displayL,
            color: theme.text,
            marginTop: Spacing.md,
            fontSize: 28,
            fontWeight: theme.displayWeight,
            textTransform: theme.uppercase ? "uppercase" : "none",
            fontStyle: theme.italicHeadlines ? "italic" : "normal",
          }}
        >
          Your stack
        </Text>
        <Text style={[Typography.body, { color: theme.textSubtle, marginTop: Spacing.xs }]}>
          Courses · skill tree · knowledge cards.
        </Text>

        {/* Tab pill */}
        <View
          style={[
            styles.tabRow,
            { borderColor: theme.border, backgroundColor: theme.surfaceCard, borderRadius: theme.btnRadius === 0 ? 0 : 999 },
          ]}
        >
          {(["courses", "tree", "cards"] as Tab[]).map((t) => {
            const active = tab === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[
                  styles.tabBtn,
                  { borderRadius: theme.btnRadius === 0 ? 0 : 999 },
                  active && {
                    backgroundColor: theme.primary,
                    shadowColor: theme.primary,
                    shadowOpacity: 0.4,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 0 },
                  },
                ]}
              >
                <Text
                  style={[
                    Typography.terminal,
                    { fontSize: 10, color: active ? theme.onPrimary : theme.textSubtle },
                  ]}
                >
                  {t === "courses" ? "COURSES" : t === "tree" ? "SKILL TREE" : "CARDS"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* COURSES */}
        {tab === "courses" && (
          <View>
            {enrolled.length === 0 ? (
              <NuvexaCard style={{ marginTop: Spacing.lg }}>
                <Text style={[Typography.titleS, { color: theme.text }]}>No purchases yet.</Text>
                <Text style={[Typography.body, { color: theme.textSubtle, marginTop: Spacing.sm }]}>
                  Try any course free for 60 seconds. Unlock to keep watching.
                </Text>
              </NuvexaCard>
            ) : (
              <View style={{ marginTop: Spacing.lg }}>
                {enrolled.map(({ course, pct }) => (
                  <Pressable
                    key={course.id}
                    onPress={() => router.push(`/course/${course.slug}`)}
                    style={{ marginBottom: Spacing.md }}
                  >
                    <NuvexaCard>
                      <View style={styles.row}>
                        <View style={[styles.thumb, { borderRadius: theme.btnRadius }]}>
                          {(() => {
                            const r = resolveThumbnail(course.thumbnail_url);
                            if (r) {
                              return (
                                <Image
                                  source={r.source as any}
                                  style={StyleSheet.absoluteFill}
                                  contentFit="cover"
                                />
                              );
                            }
                            return (
                              <LinearGradient
                                colors={[...theme.primaryGradient]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={StyleSheet.absoluteFill}
                              />
                            );
                          })()}
                          <View style={styles.thumbDim} />
                        </View>
                        <View style={{ flex: 1, marginLeft: Spacing.md }}>
                          <Text
                            style={[Typography.titleS, { color: theme.text, fontSize: 15 }]}
                            numberOfLines={2}
                          >
                            {course.title}
                          </Text>
                          <Text style={[Typography.caption, { color: theme.textMuted, marginTop: 2 }]}>
                            {course.total_lessons} lessons
                          </Text>
                          <View style={{ marginTop: Spacing.sm, flexDirection: "row", gap: 6 }}>
                            <GradientChip label={pct >= 50 ? "ELIGIBLE_FOR_TEST" : "IN_PROGRESS"} />
                          </View>
                        </View>
                        <GradientProgressRing percent={pct} size={56} stroke={5} />
                      </View>
                    </NuvexaCard>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {/* SKILL TREE */}
        {tab === "tree" && (
          <View style={{ marginTop: Spacing.lg }}>
            <TerminalLabel color={theme.textMuted}>YOUR_PATH</TerminalLabel>
            <Text style={[Typography.bodyS, { color: theme.textSubtle, marginTop: 4, marginBottom: Spacing.lg }]}>
              From beginner to Founder Cert. Complete prereqs to unlock the next.
            </Text>
            <SkillTree />
          </View>
        )}

        {/* CARDS */}
        {tab === "cards" && (
          <View style={{ marginTop: Spacing.lg }}>
            <CardDeck />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },

  tabRow: {
    flexDirection: "row",
    padding: 4,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: "center" },

  row: { flexDirection: "row", alignItems: "center" },
  thumb: { width: 64, height: 64, overflow: "hidden" },
  thumbDim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
});
