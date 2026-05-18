import React from "react";
import { Modal, View, Text, StyleSheet, Pressable, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { THEME_ICONS } from "@/themes/themeIcons";
import type { Theme } from "@/themes/types";

// Confirmation modal that previews what's about to change.
// Renders a small theme-colored N icon mock + gradient hero + Apply / Cancel.
export function ThemeApplyModal({
  theme,
  visible,
  onApply,
  onCancel,
}: {
  theme: Theme;
  visible: boolean;
  onApply: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <Animated.View
          entering={ZoomIn.springify().damping(14).stiffness(160)}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surface,
              borderColor: theme.primary,
              borderRadius: theme.cardRadius,
              shadowColor: theme.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.eyebrow,
              { color: theme.primary, textShadowColor: theme.primary },
            ]}
          >
            $ APPLY_THEME
          </Text>

          {/* Actual themed icon — same artwork shown in Profile + theme picker */}
          <View style={styles.previewRow}>
            <View style={[styles.iconTile, { borderColor: theme.border }]}>
              <Image
                source={THEME_ICONS[theme.id]}
                style={styles.iconImg}
                resizeMode="cover"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 24,
                  fontWeight: theme.displayWeight,
                  letterSpacing: -0.4,
                  textTransform: theme.uppercase ? "uppercase" : "none",
                  fontStyle: theme.italicHeadlines ? "italic" : "normal",
                }}
              >
                {theme.name}
              </Text>
              <Text style={[styles.tagline, { color: theme.textSubtle }]}>{theme.tagline}</Text>
            </View>
          </View>

          {/* Gradient sample bar */}
          <LinearGradient
            colors={[...theme.primaryGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientBar, { borderRadius: theme.btnRadius }]}
          />

          {/* What changes */}
          <View style={{ marginTop: 16 }}>
            <ChangeRow color={theme.primary} label="Colors, gradients & decorations across every screen" />
            <ChangeRow color={theme.accent1 ?? theme.primary} label="Splash animation + sound effect" />
            <ChangeRow color={theme.accent2 ?? theme.primary} label="Cards, buttons, typography shape" />
          </View>

          <Text style={[styles.footnote, { color: theme.textMuted }]}>
            Home-screen app icon stays the same · in-app icons swap to {theme.name} style.
          </Text>

          {/* CTAs */}
          <View style={styles.ctaRow}>
            <Pressable onPress={onCancel} style={[styles.cancel, { borderColor: theme.border }]}>
              <Text style={[styles.cancelText, { color: theme.textSubtle }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onApply();
              }}
              style={{ flex: 1.4 }}
            >
              <LinearGradient
                colors={[...theme.primaryGradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.apply,
                  { borderRadius: theme.btnRadius, shadowColor: theme.primary },
                ]}
              >
                <Text
                  style={[
                    styles.applyText,
                    {
                      color: theme.onPrimary,
                      textTransform: theme.uppercase ? "uppercase" : "none",
                      fontStyle: theme.italicHeadlines ? "italic" : "normal",
                    },
                  ]}
                >
                  Apply {theme.name}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function ChangeRow({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.changeRow}>
      <View
        style={[
          styles.dot,
          { backgroundColor: color, shadowColor: color },
        ]}
      />
      <Text style={[styles.changeLabel, { color: "rgba(255,255,255,0.85)" }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    padding: 24,
    shadowOpacity: 0.55,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 0 },
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
    fontFamily: "Menlo",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    marginBottom: 14,
  },
  previewRow: { flexDirection: "row", alignItems: "center" },
  iconTile: {
    width: 80,
    height: 80,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconImg: { width: 80, height: 80, borderRadius: 18 },
  tagline: { fontSize: 13, marginTop: 4 },
  gradientBar: { height: 38, marginTop: 18 },
  changeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  changeLabel: { fontSize: 13, flex: 1 },
  footnote: { fontSize: 11, marginTop: 14, fontStyle: "italic" },
  ctaRow: { flexDirection: "row", gap: 10, marginTop: 22 },
  cancel: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
  },
  cancelText: { fontSize: 14, fontWeight: "700" },
  apply: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  applyText: { fontSize: 15, fontWeight: "800", letterSpacing: 0.3 },
});
