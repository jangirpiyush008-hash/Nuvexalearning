import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";
import { resolveThumbnail } from "@/core/thumbnails";
import {
  GradientChip,
  NuvexaButton,
  NuvexaCard,
  RewardBadge,
  Spacing,
  TerminalLabel,
  Typography,
} from "@/designSystem";
import { fetchCourseBySlug, fetchLessonsForCourse } from "@/core/supabase/queries";
import { DEMO_COURSES, DEMO_LESSONS } from "@/core/demoData";
import { useAuth } from "@/features/auth/AuthProvider";
import { useTheme } from "@/themes/ThemeProvider";
import type { Course, Lesson } from "@/core/models";

export default function CourseDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { isDemo } = useAuth();
  const { theme } = useTheme();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    if (isDemo) {
      const c = DEMO_COURSES.find((x) => x.slug === slug) ?? null;
      setCourse(c);
      setLessons(c ? DEMO_LESSONS[c.slug] ?? [] : []);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const c = await fetchCourseBySlug(slug);
        if (!c) {
          const demo = DEMO_COURSES.find((x) => x.slug === slug) ?? null;
          if (demo) {
            setCourse(demo);
            setLessons(DEMO_LESSONS[demo.slug] ?? []);
          } else {
            Alert.alert("Not found", "Course missing.");
            router.back();
          }
          return;
        }
        setCourse(c);
        const ls = await fetchLessonsForCourse(c.id);
        setLessons(ls);
      } catch (e: unknown) {
        const demo = DEMO_COURSES.find((x) => x.slug === slug) ?? null;
        if (demo) {
          setCourse(demo);
          setLessons(DEMO_LESSONS[demo.slug] ?? []);
        } else {
          Alert.alert("Failed", e instanceof Error ? e.message : String(e));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, router, isDemo]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.surface }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }
  if (!course) return null;

  const trialLesson = lessons.find((l) => l.is_trial);
  const priceInr = `₹${(course.price_inr_paise / 100).toLocaleString("en-IN")}`;

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.hero,
            {
              borderBottomLeftRadius: theme.cardRadius * 1.5,
              borderBottomRightRadius: theme.cardRadius * 1.5,
            },
          ]}
        >
          {(() => {
            const r = resolveThumbnail(course.thumbnail_url);
            if (r) {
              return (
                <Image source={r.source as any} style={StyleSheet.absoluteFill} contentFit="cover" />
              );
            }
            return (
              <LinearGradient
                colors={[...theme.heroGradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            );
          })()}
          <View style={styles.heroDim} />
          <SafeAreaView edges={["top"]} style={styles.heroSafe}>
            <View style={styles.heroTopRow}>
              <Pressable onPress={() => router.back()} hitSlop={12}>
                <Text style={[Typography.terminal, { color: "#FFFFFF", fontSize: 12 }]}>← back</Text>
              </Pressable>
              <Text style={[Typography.terminal, { color: "#FFFFFF", fontSize: 11, opacity: 0.85 }]}>
                $ COURSE_DETAIL
              </Text>
            </View>
            <View style={styles.heroPlay}>
              <View
                style={[
                  styles.playCircle,
                  {
                    borderColor: theme.primary,
                    shadowColor: theme.primary,
                    shadowOpacity: 0.5,
                    shadowRadius: 24,
                    shadowOffset: { width: 0, height: 0 },
                  },
                ]}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 28, marginLeft: 4 }}>▶</Text>
              </View>
              <Text style={[Typography.caption, { color: "#FFFFFF", opacity: 0.85, marginTop: Spacing.md }]}>
                tap to preview trial
              </Text>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={{ flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.md }}>
            <GradientChip label={`${course.trial_seconds}s TRIAL`} variant="solid" />
            <GradientChip label={`${course.total_lessons} LESSONS`} />
          </View>

          <Text
            style={{
              ...Typography.displayL,
              color: theme.text,
              fontSize: 28,
              fontWeight: theme.displayWeight,
              textTransform: theme.uppercase ? "uppercase" : "none",
              fontStyle: theme.italicHeadlines ? "italic" : "normal",
            }}
          >
            {course.title}
          </Text>
          {course.description ? (
            <Text style={[Typography.body, { color: theme.textSubtle, marginTop: Spacing.sm }]}>
              {course.description}
            </Text>
          ) : null}

          <NuvexaCard
            style={{
              marginTop: Spacing.xl,
              flexDirection: "row",
              alignItems: "center",
              gap: Spacing.md,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 24,
            }}
          >
            <View style={{ flex: 1 }}>
              <TerminalLabel>FINAL_TEST · 95%+ UNLOCKS</TerminalLabel>
              <Text style={[Typography.bodyS, { color: theme.textSubtle, marginTop: 6 }]}>
                Pass with 95%+ → earn ₹10,000 in AI Credits. 70%+ → ₹200 + certificate.
              </Text>
            </View>
            <RewardBadge amountPaise={1_000_000} label="REWARD" />
          </NuvexaCard>

          <View style={{ marginTop: Spacing.xl }}>
            <View style={[styles.sectionHeader, { marginBottom: Spacing.md }]}>
              <TerminalLabel color={theme.textMuted}>CURRICULUM</TerminalLabel>
              <Text style={[Typography.caption, { color: theme.textMuted }]}>{lessons.length}</Text>
            </View>
            {lessons.map((l, i) => (
              <Animated.View key={l.id} entering={FadeInDown.duration(360).delay(60 * i)}>
                <Pressable
                  onPress={() => {
                    if (l.is_trial) {
                      router.push(`/course/player?lessonId=${l.id}`);
                    } else {
                      Alert.alert("Locked", "Unlock the course to watch this lesson.", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Unlock", onPress: () => Alert.alert("Paywall", "IAP unlock flow goes here.") },
                      ]);
                    }
                  }}
                  style={[
                    styles.lessonRow,
                    {
                      backgroundColor: theme.surfaceCard,
                      borderRadius: theme.btnRadius,
                      borderColor: theme.border,
                      borderWidth: theme.effects.pixelGrid ? 2 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.lessonNum,
                      {
                        backgroundColor: theme.surfaceElevated,
                        borderRadius: theme.btnRadius === 0 ? 0 : 8,
                      },
                    ]}
                  >
                    <Text style={{ ...Typography.mono, color: theme.primary, fontWeight: "700" }}>
                      {String(i + 1).padStart(2, "0")}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.titleS, { color: theme.text, fontSize: 15 }]} numberOfLines={1}>
                      {l.title}
                    </Text>
                    <Text style={[Typography.caption, { color: theme.textMuted, marginTop: 2 }]}>
                      {Math.round(l.duration_seconds / 60)} min{l.is_trial ? " · free trial" : ""}
                    </Text>
                  </View>
                  {l.is_trial ? (
                    <GradientChip label="FREE" variant="solid" />
                  ) : (
                    <Text style={{ fontSize: 18 }}>🔒</Text>
                  )}
                </Pressable>
              </Animated.View>
            ))}
          </View>

          <View style={{ marginTop: Spacing.xl }}>
            <TerminalLabel color={theme.textMuted}>INSTRUCTOR</TerminalLabel>
            <NuvexaCard style={{ marginTop: Spacing.sm }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: theme.surfaceElevated,
                  }}
                />
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={[Typography.titleS, { color: theme.text }]}>Verified Instructor</Text>
                  <Text style={[Typography.caption, { color: theme.textSubtle, marginTop: 2 }]}>
                    Ships AI products. Teaches what they build.
                  </Text>
                </View>
              </View>
            </NuvexaCard>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView
        edges={["bottom"]}
        style={[
          styles.cta,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            borderTopWidth: theme.effects.pixelGrid ? 2 : 1,
          },
        ]}
      >
        <View style={styles.ctaRow}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.titleM, { color: theme.text }]}>{priceInr}</Text>
            <Text style={[Typography.caption, { color: theme.textMuted }]}>
              one-time · lifetime access
            </Text>
          </View>
          {trialLesson ? (
            <View style={{ flex: 1.2 }}>
              <NuvexaButton
                label="Start 60s trial"
                onPress={() => router.push(`/course/player?lessonId=${trialLesson.id}`)}
              />
            </View>
          ) : (
            <View style={{ flex: 1.2 }}>
              <NuvexaButton
                label="Unlock"
                onPress={() => Alert.alert("Paywall", "IAP unlock goes here (server-verified).")}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 120 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { height: 320, overflow: "hidden", position: "relative" },
  heroDim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  heroSafe: { flex: 1, padding: Spacing.lg },
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroPlay: { flex: 1, alignItems: "center", justifyContent: "center" },
  playCircle: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  body: { padding: Spacing.xl, paddingTop: Spacing.lg },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  lessonNum: {
    width: 36, height: 36,
    alignItems: "center", justifyContent: "center",
    marginRight: Spacing.md,
  },
  cta: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingBottom: Spacing.sm },
});
