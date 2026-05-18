import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import {
  NuvexaButton,
  NuvexaCard,
  Spacing,
  TerminalLabel,
  Typography,
} from "@/designSystem";
import { useTheme } from "@/themes/ThemeProvider";
import { ThemeOverlay } from "@/themes/ThemeOverlay";
import { PLANS, calcRoi, type Plan } from "@/features/pricing/plans";

export default function PricingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selected, setSelected] = useState<Plan["id"]>("builder");
  const [topWins, setTopWins] = useState(0);
  const [passWins, setPassWins] = useState(2);

  const plan = useMemo(() => PLANS.find((p) => p.id === selected)!, [selected]);
  const roi = useMemo(() => calcRoi(plan, topWins, passWins), [plan, topWins, passWins]);

  const inrText = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <ThemeOverlay />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={[Typography.terminal, { color: theme.textSubtle, fontSize: 12 }]}>← back</Text>
            </Pressable>
            <TerminalLabel>PRICING</TerminalLabel>
          </View>

          {/* HERO — dramatic earn-back claim */}
          <Animated.View entering={FadeInDown.duration(450)} style={styles.hero}>
            <Text style={[styles.heroEyebrow, { color: theme.reward, textShadowColor: theme.reward }]}>
              $ PAY_ONCE · EARN_IT_BACK
            </Text>
            <Text
              style={{
                fontSize: 44,
                fontWeight: "900",
                color: theme.text,
                letterSpacing: -1,
                marginTop: 8,
                textTransform: theme.uppercase ? "uppercase" : "none",
                fontStyle: theme.italicHeadlines ? "italic" : "normal",
              }}
            >
              Win <Text style={{ color: theme.reward }}>₹10,000</Text>
            </Text>
            <Text
              style={{
                fontSize: 36,
                fontWeight: "800",
                color: theme.text,
                letterSpacing: -0.7,
                marginTop: -4,
              }}
            >
              from a <Text style={{ color: theme.primary }}>₹1,999</Text> course.
            </Text>
            <Text style={[Typography.body, { color: theme.textSubtle, marginTop: Spacing.md, lineHeight: 22 }]}>
              Pass any final test with 95%+ → ₹10,000 in AI Credits. 70%+ → ₹200.
              {"\n"}One-time payment · Lifetime access · Refund if you don't pass in 60 days.
            </Text>
          </Animated.View>

          {/* ── ROI calculator ──────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(500).delay(120)}>
            <View
              style={[
                styles.roi,
                {
                  borderColor: roi.net >= 0 ? theme.reward : theme.border,
                  borderRadius: theme.cardRadius,
                  backgroundColor: theme.surfaceCard,
                  shadowColor: roi.net >= 0 ? theme.reward : theme.primary,
                },
              ]}
            >
              <Text style={[styles.eyebrow, { color: theme.reward, textShadowColor: theme.reward }]}>
                $ ROI_CALCULATOR
              </Text>

              <View style={[styles.planRow, { borderColor: theme.border, backgroundColor: theme.surfaceElevated }]}>
                {PLANS.map((p) => {
                  const active = selected === p.id;
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => setSelected(p.id)}
                      style={[
                        styles.planChip,
                        active && { backgroundColor: theme.primary, shadowColor: theme.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
                      ]}
                    >
                      <Text
                        style={[
                          Typography.terminal,
                          { fontSize: 10, color: active ? theme.onPrimary : theme.textSubtle },
                        ]}
                      >
                        {p.name.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Stepper
                label="95%+ wins (₹10k each)"
                value={topWins}
                onDec={() => setTopWins(Math.max(0, topWins - 1))}
                onInc={() => setTopWins(Math.min(plan.courseSlots, topWins + 1))}
                accent={theme.reward}
              />
              <Stepper
                label="70%+ wins (₹200 each)"
                value={passWins}
                onDec={() => setPassWins(Math.max(0, passWins - 1))}
                onInc={() => setPassWins(Math.min(plan.courseSlots, passWins + 1))}
                accent={theme.primary}
              />

              <View style={[styles.mathRow, { borderTopColor: theme.border }]}>
                <View style={styles.mathCol}>
                  <Text style={[Typography.caption, { color: theme.textMuted }]}>You pay</Text>
                  <Text style={[styles.mathVal, { color: theme.text }]}>{inrText(plan.pricePaise)}</Text>
                </View>
                <Text style={{ color: theme.textMuted, fontSize: 24, fontWeight: "200" }}>→</Text>
                <View style={styles.mathCol}>
                  <Text style={[Typography.caption, { color: theme.textMuted }]}>You earn</Text>
                  <Text
                    style={[
                      styles.mathVal,
                      { color: theme.reward, textShadowColor: theme.reward, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
                    ]}
                  >
                    {inrText(roi.earned)}
                  </Text>
                </View>
                <Text style={{ color: theme.textMuted, fontSize: 24, fontWeight: "200" }}>=</Text>
                <View style={styles.mathCol}>
                  <Text style={[Typography.caption, { color: theme.textMuted }]}>Net</Text>
                  <Text
                    style={[
                      styles.mathVal,
                      { color: roi.net >= 0 ? theme.reward : theme.danger, fontWeight: "900" },
                    ]}
                  >
                    {roi.net >= 0 ? "+" : "−"}{inrText(Math.abs(roi.net))}
                  </Text>
                </View>
              </View>
              <Text style={[Typography.caption, { color: theme.textMuted, marginTop: 8, textAlign: "center" }]}>
                {roi.net >= 0
                  ? `🎯  Net positive — ${roi.netPct}% ROI`
                  : `Need ${Math.ceil((plan.pricePaise - roi.earned) / 20_000)} more pass-tier wins to break even`}
              </Text>
            </View>
          </Animated.View>

          {/* ── Plans ─────────────────────────────────────────── */}
          <Text style={[styles.sectionH, { color: theme.textMuted }]}>$ CHOOSE_YOUR_PLAN</Text>
          {PLANS.map((p, i) => (
            <Animated.View key={p.id} entering={FadeInDown.duration(450).delay(220 + i * 80)}>
              <PlanCard plan={p} onPress={() => setSelected(p.id)} isSelected={selected === p.id} />
            </Animated.View>
          ))}

          {/* ── Refund insurance ──────────────────────────────── */}
          <Animated.View entering={FadeIn.duration(500).delay(580)}>
            <NuvexaCard style={{ marginTop: Spacing.lg, borderColor: theme.primary, borderWidth: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <Text style={{ fontSize: 28 }}>🛡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.eyebrow, { color: theme.primary, textShadowColor: theme.primary }]}>
                    $ REFUND_INSURANCE
                  </Text>
                  <Text style={[Typography.titleS, { color: theme.text, marginTop: 6 }]}>
                    Pass 70% in 60 days, or full refund.
                  </Text>
                  <Text style={[Typography.bodyS, { color: theme.textSubtle, marginTop: 4, lineHeight: 19 }]}>
                    We're aligned. We win when you win. If you don't pass any course within 60 days of purchase, we refund the whole amount. No questions.
                  </Text>
                </View>
              </View>
            </NuvexaCard>
          </Animated.View>

          {/* ── CTA ───────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(500).delay(680)} style={{ marginTop: Spacing.xl }}>
            <NuvexaButton
              label={`Get ${plan.name} · ${inrText(plan.pricePaise)}`}
              onPress={() =>
                Alert.alert(
                  "Checkout (demo)",
                  `In prod this opens StoreKit IAP for ${plan.name} (${inrText(plan.pricePaise)}).\nReceipt is verified by Edge Function before unlocking.`,
                )
              }
            />
            <View style={{ height: Spacing.sm }} />
            <Text style={[Typography.caption, { color: theme.textMuted, textAlign: "center" }]}>
              No subscription · No auto-renew · One-time · Lifetime
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Stepper({
  label,
  value,
  onDec,
  onInc,
  accent,
}: {
  label: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
  accent: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.stepRow}>
      <Text style={[Typography.body, { color: theme.text, flex: 1 }]}>{label}</Text>
      <Pressable onPress={onDec} style={[styles.stepBtn, { borderColor: theme.border }]}>
        <Text style={{ color: theme.textSubtle, fontSize: 20, fontWeight: "700" }}>−</Text>
      </Pressable>
      <Text
        style={[
          styles.stepValue,
          { color: accent, textShadowColor: accent },
        ]}
      >
        {value}
      </Text>
      <Pressable onPress={onInc} style={[styles.stepBtn, { borderColor: theme.border }]}>
        <Text style={{ color: theme.textSubtle, fontSize: 20, fontWeight: "700" }}>+</Text>
      </Pressable>
    </View>
  );
}

function PlanCard({
  plan,
  isSelected,
  onPress,
}: {
  plan: Plan;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const accentBorder = isSelected
    ? theme.primary
    : plan.popular
      ? theme.reward
      : theme.border;
  return (
    <Pressable onPress={onPress} style={{ marginTop: Spacing.md }}>
      <View
        style={[
          styles.planCard,
          {
            backgroundColor: theme.surfaceCard,
            borderColor: accentBorder,
            borderRadius: theme.cardRadius,
            borderWidth: isSelected ? 2 : 1,
            shadowColor: isSelected ? theme.primary : plan.popular ? theme.reward : "transparent",
          },
        ]}
      >
        {plan.popular ? (
          <LinearGradient
            colors={[theme.reward + "22", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        ) : null}

        {plan.badge && (
          <View
            style={[
              styles.planBadge,
              { backgroundColor: plan.popular ? theme.reward : theme.primary },
            ]}
          >
            <Text style={[Typography.terminal, { color: theme.onPrimary, fontSize: 9 }]}>
              {plan.badge}
            </Text>
          </View>
        )}
        <View style={styles.planHead}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.text,
                fontSize: 24,
                fontWeight: "900",
                letterSpacing: -0.4,
                textTransform: theme.uppercase ? "uppercase" : "none",
                fontStyle: theme.italicHeadlines ? "italic" : "normal",
              }}
            >
              {plan.name}
            </Text>
            <Text style={[Typography.caption, { color: theme.textSubtle, marginTop: 2 }]}>
              {plan.highlight}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ ...Typography.displayL, color: theme.text, fontSize: 32, fontWeight: "900" }}>
              ₹{(plan.pricePaise / 100).toLocaleString("en-IN")}
            </Text>
            <Text style={[Typography.caption, { color: theme.textMuted, marginTop: -2 }]}>one-time</Text>
          </View>
        </View>

        <View style={styles.planMeta}>
          <Text style={[Typography.mono, { color: theme.primary, fontSize: 12 }]}>
            {plan.courseSlots} courses · ₹{(plan.perCourse / 100).toLocaleString("en-IN")} per course
          </Text>
        </View>

        <View style={styles.perks}>
          {plan.perks.map((p) => (
            <View key={p} style={styles.perkRow}>
              <Text style={[{ color: theme.primary, marginRight: 8, fontWeight: "800", fontSize: 14 }]}>✓</Text>
              <Text style={[Typography.bodyS, { color: theme.text, flex: 1, lineHeight: 19 }]}>{p}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  hero: { marginTop: Spacing.xl },
  heroEyebrow: {
    ...Typography.terminal,
    fontSize: 11,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  roi: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  eyebrow: {
    ...Typography.terminal,
    fontSize: 10,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  planRow: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  planChip: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 999 },

  stepRow: { flexDirection: "row", alignItems: "center", marginTop: Spacing.md, gap: Spacing.sm },
  stepBtn: {
    width: 36, height: 36,
    alignItems: "center", justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  stepValue: {
    ...Typography.mono,
    fontSize: 20,
    fontWeight: "800",
    minWidth: 32,
    textAlign: "center",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  mathRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
    borderTopWidth: 1,
    gap: 6,
  },
  mathCol: { alignItems: "center" },
  mathVal: { ...Typography.titleM, fontWeight: "800" },

  sectionH: {
    ...Typography.terminal,
    fontSize: 10,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.sm,
    letterSpacing: 1.6,
  },

  planCard: {
    padding: Spacing.lg,
    paddingTop: Spacing.lg + 4,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
  },
  planBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderBottomLeftRadius: 14,
  },
  planHead: { flexDirection: "row", alignItems: "flex-start" },
  planMeta: { marginTop: Spacing.sm, paddingBottom: Spacing.sm },
  perks: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  perkRow: { flexDirection: "row", marginBottom: 6 },
});
