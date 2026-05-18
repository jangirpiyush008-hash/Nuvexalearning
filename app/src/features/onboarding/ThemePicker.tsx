import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { THEMES, THEME_ORDER } from "@/themes/themes";
import { useTheme } from "@/themes/ThemeProvider";
import { playSplashSoundFor } from "@/themes/audio/ThemeAudio";
import { ThemeApplyModal } from "./ThemeApplyModal";
import type { Theme } from "@/themes/types";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W * 0.78;
const CARD_H = 460;
const SIDE_PAD = (SCREEN_W - CARD_W) / 2;

export function ThemePicker({
  onSelect,
  showHeader = true,
  initialIndex,
}: {
  onSelect: (themeId: Theme["id"]) => void;
  showHeader?: boolean;
  initialIndex?: number;
}) {
  const { themeId } = useTheme();
  const startIdx = initialIndex ?? Math.max(0, THEME_ORDER.indexOf(themeId));
  const [index, setIndex] = useState(startIdx);
  const [confirm, setConfirm] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / CARD_W);
    if (i !== index && i >= 0 && i < THEME_ORDER.length) {
      Haptics.selectionAsync();
      setIndex(i);
    }
  };

  const activeTheme = THEMES[THEME_ORDER[index]];

  return (
    <View style={[styles.root, { backgroundColor: activeTheme.surface }]}>
      {/* Background bleed of the active theme primary */}
      <View style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}>
        <LinearGradient
          colors={[`${activeTheme.primary}33`, "transparent", `${activeTheme.primary}11`]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {showHeader && (
        <Animated.View entering={FadeInDown.duration(380)} style={styles.header}>
          <Text style={[styles.eyebrow, { color: activeTheme.primary }]}>$ CHOOSE_THEME</Text>
          <Text style={[styles.headline, { color: activeTheme.text }]}>Pick your vibe.</Text>
          <Text style={[styles.sub, { color: activeTheme.textSubtle }]}>
            Switch any time from Profile.
          </Text>
        </Animated.View>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={CARD_W}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        contentContainerStyle={{ paddingHorizontal: SIDE_PAD }}
        contentOffset={{ x: startIdx * CARD_W, y: 0 }}
      >
        {THEME_ORDER.map((id, i) => (
          <ThemeCard
            key={id}
            theme={THEMES[id]}
            active={i === index}
            isCurrent={id === themeId}
          />
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View style={styles.dots}>
        {THEME_ORDER.map((id, i) => (
          <View
            key={id}
            style={[
              styles.dot,
              { backgroundColor: i === index ? activeTheme.primary : activeTheme.border },
              i === index && { width: 20 },
            ]}
          />
        ))}
      </View>

      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          playSplashSoundFor(THEME_ORDER[index]);
        }}
        style={[
          styles.soundPill,
          { borderColor: activeTheme.primary, alignSelf: "center" },
        ]}
      >
        <Text style={[styles.soundPillText, { color: activeTheme.primary }]}>
          ▶ preview sound
        </Text>
      </Pressable>

      <ThemeApplyModal
        theme={activeTheme}
        visible={confirm}
        onApply={() => {
          setConfirm(false);
          onSelect(THEME_ORDER[index]);
        }}
        onCancel={() => setConfirm(false)}
      />

      <View style={[styles.cta, { paddingHorizontal: SIDE_PAD }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setConfirm(true);
          }}
        >
          <LinearGradient
            colors={[...activeTheme.primaryGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.ctaInner,
              {
                borderRadius: activeTheme.btnRadius,
                shadowColor: activeTheme.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.ctaLabel,
                {
                  color: activeTheme.onPrimary,
                  textTransform: activeTheme.uppercase ? "uppercase" : "none",
                  fontStyle: activeTheme.italicHeadlines ? "italic" : "normal",
                },
              ]}
            >
              Use {activeTheme.name}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Mini-preview card per theme — each rendered in that theme's tokens.
// ─────────────────────────────────────────────────────────────────────────
function ThemeCard({
  theme,
  active,
  isCurrent,
}: {
  theme: Theme;
  active: boolean;
  isCurrent: boolean;
}) {
  const scale = useSharedValue(active ? 1 : 0.84);
  const opacity = useSharedValue(active ? 1 : 0.55);
  const rotate = useSharedValue(0);
  const translateY = useSharedValue(active ? 0 : 8);

  React.useEffect(() => {
    scale.value = withTiming(active ? 1 : 0.84, { duration: 320, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(active ? 1 : 0.55, { duration: 320 });
    translateY.value = withTiming(active ? 0 : 8, { duration: 320, easing: Easing.out(Easing.cubic) });
    if (active) {
      // Subtle breath on the active card — feels alive
      rotate.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
          withTiming(-0.4, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    } else {
      rotate.value = withTiming(0, { duration: 300 });
    }
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateZ: `${rotate.value}deg` },
    ],
  }));

  return (
    <View style={{ width: CARD_W, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={[
          styles.card,
          animStyle,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderRadius: theme.cardRadius,
          },
        ]}
      >
        {/* Theme-signature hero */}
        <LinearGradient
          colors={[...theme.heroGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.cardHero,
            { borderRadius: Math.max(0, theme.cardRadius - 6) },
          ]}
        >
          <Text
            style={[
              styles.cardHeroText,
              {
                color: theme.onPrimary,
                textTransform: theme.uppercase ? "uppercase" : "none",
                fontStyle: theme.italicHeadlines ? "italic" : "normal",
                fontWeight: theme.displayWeight,
              },
            ]}
          >
            {theme.name}
          </Text>
        </LinearGradient>

        {/* Theme-signature decor strip */}
        <ThemeSignatureStrip theme={theme} />

        {/* Mini button preview */}
        <View style={styles.cardBody}>
          <Text style={[styles.tagline, { color: theme.textSubtle }]}>{theme.tagline}</Text>

          <LinearGradient
            colors={[...theme.primaryGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.miniBtn,
              {
                borderRadius: theme.btnRadius,
                shadowColor: theme.primary,
              },
            ]}
          >
            <Text style={[styles.miniBtnText, { color: theme.onPrimary }]}>Get started</Text>
          </LinearGradient>

          <View style={styles.miniChips}>
            <Chip theme={theme} label="ENERGY" solid />
            <Chip theme={theme} label="SOCIAL" />
            <Chip theme={theme} label="LEARN" />
          </View>

          {isCurrent && (
            <View style={[styles.currentBadge, { borderColor: theme.primary }]}>
              <Text style={[styles.currentBadgeText, { color: theme.primary }]}>● CURRENT</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

function ThemeSignatureStrip({ theme }: { theme: Theme }) {
  // Visual identity hint per theme
  if (theme.effects.scanlines) {
    return (
      <View style={styles.sigStrip}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 1,
              backgroundColor: theme.primary,
              opacity: 0.5 - i * 0.05,
              marginVertical: 2,
            }}
          />
        ))}
      </View>
    );
  }
  if (theme.effects.comicDots) {
    return (
      <View style={[styles.sigStrip, { flexDirection: "row", justifyContent: "space-around", paddingVertical: 8 }]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i % 2 ? theme.primary : theme.accent,
            }}
          />
        ))}
      </View>
    );
  }
  if (theme.effects.marvelStreaks) {
    return (
      <View style={[styles.sigStrip, { flexDirection: "row", gap: 4, paddingVertical: 6 }]}>
        {[1, 0.8, 0.6, 0.4, 0.2].map((o, i) => (
          <View key={i} style={{ flex: 1, height: 4, backgroundColor: theme.accent, opacity: o }} />
        ))}
      </View>
    );
  }
  if (theme.effects.pixelGrid) {
    return (
      <View style={[styles.sigStrip, { flexDirection: "row", borderTopWidth: 2, borderBottomWidth: 2, borderColor: "#000", paddingVertical: 4, backgroundColor: "#C0C0C0" }]}>
        <View style={{ flex: 1, height: 14, backgroundColor: "#0000AA", justifyContent: "center", paddingHorizontal: 6 }}>
          <Text style={{ color: "#fff", fontSize: 8, fontFamily: "Courier" }}>C:\NUVEXA.EXE</Text>
        </View>
        <View style={{ width: 14, height: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#000", marginLeft: 2 }} />
      </View>
    );
  }
  if (theme.effects.glassBlur) {
    return (
      <View style={[styles.sigStrip, { paddingVertical: 8, paddingHorizontal: 8 }]}>
        <LinearGradient
          colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.04)"]}
          style={{
            height: 14,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        />
      </View>
    );
  }
  return <View style={styles.sigStrip} />;
}

function Chip({ theme, label, solid }: { theme: Theme; label: string; solid?: boolean }) {
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.btnRadius,
        backgroundColor: solid ? theme.primary : "transparent",
        borderWidth: solid ? 0 : 1,
        borderColor: theme.border,
      }}
    >
      <Text
        style={{
          fontSize: 9,
          fontWeight: "700",
          letterSpacing: 0.8,
          color: solid ? theme.onPrimary : theme.textSubtle,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.6, fontFamily: "Menlo" },
  headline: { fontSize: 32, fontWeight: "800", letterSpacing: -0.6, marginTop: 6 },
  sub: { fontSize: 14, marginTop: 4 },

  card: {
    width: CARD_W - 24,
    height: CARD_H,
    borderWidth: 1,
    padding: 14,
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  cardHero: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeroText: {
    fontSize: 28,
    letterSpacing: -0.4,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  sigStrip: { marginTop: 8, marginBottom: 8 },

  cardBody: { padding: 6 },
  tagline: { fontSize: 13, marginBottom: 14 },

  miniBtn: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  miniBtnText: { fontSize: 14, fontWeight: "700" },

  miniChips: { flexDirection: "row", gap: 6, marginTop: 14, flexWrap: "wrap" },

  currentBadge: {
    marginTop: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 4,
  },
  currentBadgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },

  dots: { flexDirection: "row", justifyContent: "center", marginTop: 12, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  soundPill: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 999,
  },
  soundPillText: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, fontFamily: "Menlo" },

  cta: { paddingTop: 18, paddingBottom: 36 },
  ctaInner: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
  },
  ctaLabel: { fontSize: 17, fontWeight: "800", letterSpacing: 0.4 },
});
