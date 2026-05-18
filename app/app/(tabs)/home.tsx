import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import {
  GradientChip,
  NuvexaCard,
  Spacing,
  TerminalLabel,
  Typography,
} from "@/designSystem";
import { fetchPublishedCourses } from "@/core/supabase/queries";
import { resolveThumbnail } from "@/core/thumbnails";
import { useAuth } from "@/features/auth/AuthProvider";
import { useTheme } from "@/themes/ThemeProvider";
import { ThemeOverlay } from "@/themes/ThemeOverlay";
import { DailySprintCard } from "@/features/sprint/DailySprintCard";
import { StreakSaveModal } from "@/features/streak/StreakSaveModal";
import * as Haptics from "expo-haptics";
import type { Course } from "@/core/models";

const CATEGORIES: Array<{ name: string; emoji: string; count: number; gradient: readonly [string, string] }> = [
  { name: "AI",         emoji: "🧠", count: 12, gradient: ["#39FF6A", "#00CC6E"] },
  { name: "RAG",        emoji: "🔍", count: 8,  gradient: ["#00E5FF", "#0078D4"] },
  { name: "Agents",     emoji: "🤖", count: 6,  gradient: ["#FFB400", "#FF5A1F"] },
  { name: "SaaS",       emoji: "🚀", count: 9,  gradient: ["#FF1493", "#A435F0"] },
  { name: "No-code",    emoji: "🪄", count: 5,  gradient: ["#FFE600", "#FF7A00"] },
  { name: "Voice",      emoji: "🎙", count: 4,  gradient: ["#FF9CC2", "#9C8CFF"] },
];

const TOP_VOICES = [
  { name: "arjun",   outcome: "Shipped" },
  { name: "priya",   outcome: "Quit" },
  { name: "neha",    outcome: "Raised" },
  { name: "vikram",  outcome: "Hired" },
  { name: "ananya",  outcome: "First $1" },
  { name: "ravi",    outcome: "Promoted" },
];

const WINS = [
  { name: "Arjun K.", amount: 10000, when: "2h" },
  { name: "Priya M.", amount: 200,   when: "4h" },
  { name: "Neha V.",  amount: 10000, when: "5h" },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [winIdx, setWinIdx] = useState(0);
  const [streakModal, setStreakModal] = useState(false);
  const [streak, setStreak] = useState(7);

  const load = async () => {
    try {
      setError(null);
      const data = await fetchPublishedCourses();
      setCourses(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Cycle the live win ticker
  useEffect(() => {
    const id = setInterval(() => setWinIdx((i) => (i + 1) % WINS.length), 3000);
    return () => clearInterval(id);
  }, []);

  const filtered = activeCategory
    ? courses.filter(
        (c) =>
          c.title.toLowerCase().includes(activeCategory.toLowerCase()) ||
          c.description?.toLowerCase().includes(activeCategory.toLowerCase()),
      )
    : courses;
  const hero = filtered[0];
  const rest = filtered.slice(1);

  const win = WINS[winIdx];
  const winColor = win.amount === 10000 ? theme.reward : theme.primary;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.surface }]}>
      <ThemeOverlay />
      <FlatList
        data={rest}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={
          <View>
            {/* ── Top bar — minimal ─────────────────────────────────── */}
            <View style={styles.topBar}>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setStreakModal(true);
                }}
                style={styles.streakChip}
              >
                <Text style={styles.fire}>🔥</Text>
                <Text style={[styles.streakNum, { color: theme.text }]}>{streak}</Text>
                <Text style={[styles.coin, { color: theme.accent1, textShadowColor: theme.accent1 }]}>·</Text>
                <Text style={[styles.coin, { color: theme.accent1, textShadowColor: theme.accent1 }]}>₹</Text>
                <Text style={[styles.streakNum, { color: theme.text }]}>200</Text>
              </Pressable>

              <Pressable onPress={() => router.push("/(tabs)/profile")}>
                <View
                  style={[
                    styles.avatarSmall,
                    { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                  ]}
                >
                  <Text style={[Typography.titleS, { color: theme.text, fontSize: 13 }]}>
                    {(user?.email ?? "?")[0]?.toUpperCase()}
                  </Text>
                </View>
              </Pressable>
            </View>

            {/* ── HERO — big poster ─────────────────────────────────── */}
            {hero ? (
              <Animated.View entering={FadeInDown.duration(450)}>
                <Pressable
                  onPress={() => router.push(`/course/${hero.slug}`)}
                  style={{ marginTop: Spacing.lg }}
                >
                  <View
                    style={[
                      styles.hero,
                      {
                        borderRadius: theme.cardRadius,
                        borderColor: theme.border,
                        shadowColor: theme.primary,
                      },
                    ]}
                  >
                    {(() => {
                      const r = resolveThumbnail(hero.thumbnail_url);
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
                          colors={[...theme.heroGradient]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={StyleSheet.absoluteFill}
                        />
                      );
                    })()}
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.85)"]}
                      style={[StyleSheet.absoluteFill, { top: "40%" }]}
                    />
                    <View style={styles.heroBody}>
                      <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                        <GradientChip label="60s · FREE" variant="solid" />
                      </View>
                      <Text style={styles.heroTitle} numberOfLines={2}>
                        {hero.title}
                      </Text>
                      <View style={styles.heroFooter}>
                        <Text style={[styles.heroPrice, { color: theme.accent1, textShadowColor: theme.accent1 }]}>
                          ₹{(hero.price_inr_paise / 100).toLocaleString("en-IN")}
                        </Text>
                        <View style={[styles.playPill, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
                          <Text style={[styles.playPillText, { color: theme.onPrimary }]}>▶ start trial</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ) : null}

            {/* ── Win ticker + prize meter, single row ──────────────── */}
            <Animated.View entering={FadeInDown.duration(400).delay(80)} style={{ marginTop: Spacing.xl }}>
              <View style={styles.tickerRow}>
                <View
                  style={[
                    styles.tickerCard,
                    { backgroundColor: theme.surfaceCard, borderColor: theme.border },
                  ]}
                >
                  <View style={[styles.liveDot, { backgroundColor: winColor, shadowColor: winColor }]} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.tickName, { color: theme.text }]} numberOfLines={1}>
                      {win.name}{" "}
                      <Text style={{ color: theme.textSubtle, fontWeight: "400" }}>won</Text>
                    </Text>
                    <Text style={[styles.tickAmount, { color: winColor, textShadowColor: winColor }]}>
                      ₹{win.amount.toLocaleString("en-IN")} · {win.when} ago
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.tickerCard,
                    { backgroundColor: theme.surfaceCard, borderColor: theme.border, marginLeft: 8 },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.poolNumber, { color: theme.accent2, textShadowColor: theme.accent2 }]}>
                      62<Text style={{ color: theme.textMuted, fontSize: 14 }}>/100</Text>
                    </Text>
                    <Text style={[styles.poolLabel, { color: theme.textMuted }]}>spots left · 14d</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* ── Daily Sprint + Arcade — side by side ─────────────── */}
            <Animated.View entering={FadeInDown.duration(400).delay(160)} style={{ marginTop: Spacing.md }}>
              <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                <View style={{ flex: 1.4 }}>
                  <DailySprintCard />
                </View>
                <Pressable
                  onPress={() => router.push("/arcade")}
                  style={[
                    styles.arcadeCard,
                    {
                      flex: 1,
                      backgroundColor: theme.surfaceCard,
                      borderColor: theme.accent2,
                      borderRadius: theme.cardRadius,
                      shadowColor: theme.accent2,
                    },
                  ]}
                >
                  <Text style={[styles.arcadeEyebrow, { color: theme.accent2, textShadowColor: theme.accent2 }]}>
                    $ ARCADE
                  </Text>
                  <Text style={styles.arcadeEmoji}>🎮</Text>
                  <Text style={[styles.arcadeTitle, { color: theme.text }]}>Prompt Pop</Text>
                  <Text style={[styles.arcadeSub, { color: theme.textMuted }]}>tap to play</Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* ── USP poster — minimal text, big number ─────────────── */}
            <Animated.View entering={FadeInDown.duration(450).delay(240)} style={{ marginTop: Spacing.md }}>
              <Pressable
                onPress={() => router.push("/(auth)/pricing")}
                style={[
                  styles.uspPoster,
                  {
                    borderRadius: theme.cardRadius,
                    borderColor: theme.reward,
                    backgroundColor: theme.surfaceCard,
                    shadowColor: theme.reward,
                  },
                ]}
              >
                <LinearGradient
                  colors={[theme.reward + "33", "transparent"]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.uspLeft}>
                  <Text style={[styles.uspEyebrow, { color: theme.reward, textShadowColor: theme.reward }]}>
                    $ USP
                  </Text>
                  <Text style={[styles.uspBig, { color: theme.reward, textShadowColor: theme.reward }]}>
                    ₹10,000
                  </Text>
                  <Text style={[styles.uspBy, { color: theme.text }]}>for 95%+ on final test</Text>
                </View>
                <View style={[styles.uspBolt, { backgroundColor: theme.reward + "22", borderColor: theme.reward }]}>
                  <Text style={styles.uspBoltGlyph}>⚡</Text>
                </View>
              </Pressable>
            </Animated.View>

            {/* ── Top voices — pure visual story rings, no header copy ── */}
            <Animated.View entering={FadeIn.duration(500).delay(320)} style={{ marginTop: Spacing.xxl }}>
              <View style={styles.sectionRow}>
                <TerminalLabel color={theme.textMuted}>VOICES</TerminalLabel>
                <Pressable onPress={() => router.push("/(tabs)/voices")}>
                  <Text style={[Typography.caption, { color: theme.accent1 }]}>see all →</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.md }}>
                {TOP_VOICES.map((v) => (
                  <Pressable
                    key={v.name}
                    onPress={() =>
                      Alert.alert(`@${v.name}`, `Top voice this week.\nOutcome: ${v.outcome}`)
                    }
                    style={styles.storyItem}
                  >
                    <View style={[styles.storyRingWrap, { shadowColor: theme.accent2 }]}>
                      <LinearGradient
                        colors={["#F58529", "#DD2A7B", "#8134AF", "#515BD4"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[StyleSheet.absoluteFillObject, { borderRadius: 36 }]}
                      />
                      <View
                        style={[
                          styles.storyAvatar,
                          { backgroundColor: theme.surface, borderColor: theme.surface },
                        ]}
                      >
                        <Text style={[Typography.titleS, { color: theme.text }]}>
                          {v.name[0]?.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.storyName, { color: theme.textSubtle }]}>{v.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>

            {/* ── Category tiles — 3-col mini posters, emoji-first ──── */}
            <Animated.View entering={FadeIn.duration(500).delay(400)} style={{ marginTop: Spacing.xxl }}>
              <View style={styles.sectionRow}>
                <TerminalLabel color={theme.textMuted}>CATEGORIES</TerminalLabel>
                {activeCategory ? (
                  <Pressable onPress={() => setActiveCategory(null)}>
                    <Text style={[Typography.caption, { color: theme.accent2 }]}>clear ×</Text>
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.catGrid}>
                {CATEGORIES.map((c) => {
                  const active = activeCategory === c.name;
                  return (
                    <Pressable
                      key={c.name}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setActiveCategory(active ? null : c.name);
                      }}
                      style={[
                        styles.catTile,
                        {
                          borderColor: active ? theme.primary : theme.border,
                          borderWidth: active ? 2 : 1,
                          shadowColor: active ? theme.primary : "transparent",
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={[...c.gradient]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={styles.catDim} />
                      <Text style={styles.catEmoji}>{c.emoji}</Text>
                      <Text style={styles.catName}>{c.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>

            {/* ── All courses divider ─────────────────────────────── */}
            <View style={[styles.sectionRow, { marginTop: Spacing.xxl }]}>
              <TerminalLabel color={theme.textMuted}>
                {activeCategory ? activeCategory.toUpperCase() : "ALL"}
              </TerminalLabel>
              <Text style={[Typography.caption, { color: theme.textMuted }]}>
                {filtered.length} total
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : error && filtered.length === 0 ? (
            <Text style={{ ...Typography.body, color: theme.danger, textAlign: "center" }}>
              {error}
            </Text>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={{ ...Typography.body, color: theme.textSubtle, textAlign: "center" }}>
                Nothing matches.
              </Text>
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.duration(400).delay(60 * index)}>
            <Pressable onPress={() => router.push(`/course/${item.slug}`)}>
              <NuvexaCard style={{ marginTop: Spacing.md, padding: 0, overflow: "hidden" }}>
                <View style={styles.cardThumb}>
                  {(() => {
                    const r = resolveThumbnail(item.thumbnail_url);
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
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.75)"]}
                    style={[StyleSheet.absoluteFill, { top: "50%" }]}
                  />
                  <View style={styles.cardChips}>
                    <GradientChip label="60s" />
                  </View>
                  <View style={styles.cardFooterOnImg}>
                    <Text style={styles.cardTitleOnImg} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                      <Text style={[styles.cardPriceOnImg, { color: theme.accent1, textShadowColor: theme.accent1 }]}>
                        ₹{(item.price_inr_paise / 100).toLocaleString("en-IN")}
                      </Text>
                      <Text style={[styles.cardMetaOnImg, { color: theme.textSubtle }]}>
                        {item.total_lessons} lessons
                      </Text>
                    </View>
                  </View>
                </View>
              </NuvexaCard>
            </Pressable>
          </Animated.View>
        )}
      />

      <StreakSaveModal
        visible={streakModal}
        streakDays={streak}
        costCredits={50}
        onFreeze={() => {
          setStreakModal(false);
          Alert.alert("Streak frozen", "Spent 50 credits. Safe until tomorrow.");
        }}
        onLetItGo={() => {
          setStreakModal(false);
          setStreak(0);
        }}
        onClose={() => setStreakModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.xxxl },

  // top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  fire: { fontSize: 14 },
  streakNum: { ...Typography.titleS, fontSize: 14, fontWeight: "800" },
  coin: {
    fontSize: 14,
    fontWeight: "800",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  // hero
  hero: {
    overflow: "hidden",
    height: 260,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  heroBody: { flex: 1, padding: Spacing.lg, justifyContent: "flex-end" },
  heroTitle: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.6,
    color: "#FFFFFF",
    marginTop: Spacing.md,
    lineHeight: 30,
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  heroPrice: {
    fontSize: 24,
    fontWeight: "900",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  playPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  playPillText: { fontSize: 13, fontWeight: "800", letterSpacing: 0.3 },

  // ticker + pool row
  tickerRow: { flexDirection: "row" },
  tickerCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 56,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  tickName: { ...Typography.bodyS, fontWeight: "700" },
  tickAmount: {
    fontSize: 11,
    fontWeight: "800",
    fontFamily: "Menlo",
    marginTop: 1,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  poolNumber: {
    fontSize: 22,
    fontWeight: "900",
    fontFamily: "Menlo",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  poolLabel: { ...Typography.caption, marginTop: 1, fontSize: 10 },

  // USP poster
  uspPoster: {
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  uspLeft: { flex: 1 },
  uspEyebrow: {
    ...Typography.terminal,
    fontSize: 10,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  uspBig: {
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
    marginTop: 2,
  },
  uspBy: { ...Typography.bodyS, marginTop: 2, opacity: 0.85 },
  uspBolt: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  uspBoltGlyph: { fontSize: 30 },

  // sections
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // stories
  storyItem: { alignItems: "center", marginRight: 14, width: 72 },
  storyRingWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  storyName: { ...Typography.caption, marginTop: 6, fontSize: 11 },

  // category tiles
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  catTile: {
    width: "30%",
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
  },
  catDim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  catEmoji: { fontSize: 32 },
  catName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginTop: 4,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // course cards — image-first
  cardThumb: {
    width: "100%",
    height: 200,
    position: "relative",
    overflow: "hidden",
  },
  cardChips: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
  },
  cardFooterOnImg: {
    position: "absolute",
    left: Spacing.md,
    right: Spacing.md,
    bottom: Spacing.md,
  },
  cardTitleOnImg: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardPriceOnImg: {
    fontSize: 15,
    fontWeight: "900",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  cardMetaOnImg: { fontSize: 11 },

  emptyWrap: { paddingVertical: Spacing.xxxl, alignItems: "center" },

  arcadeCard: {
    padding: Spacing.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  arcadeEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.6,
    fontFamily: "Menlo",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  arcadeEmoji: { fontSize: 38, marginTop: 6 },
  arcadeTitle: { fontSize: 14, fontWeight: "800", marginTop: 4 },
  arcadeSub: { fontSize: 10, marginTop: 2 },
});
