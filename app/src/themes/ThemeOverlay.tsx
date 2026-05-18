import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "./ThemeProvider";
import { MatrixRain } from "./decorations/MatrixRain";
import { ComicBackground } from "./decorations/ComicBackground";
import { MarvelBackground } from "./decorations/MarvelBackground";
import { SynthwaveBackground } from "./decorations/SynthwaveBackground";
import { GlassBackground } from "./decorations/GlassBackground";

// Renders theme-specific full-screen decoration BELOW content (pointerEvents=none).
export function ThemeOverlay() {
  const { theme } = useTheme();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {theme.id === "neon-os" && <MatrixRain />}
      {theme.id === "cartoon" && <ComicBackground />}
      {theme.id === "marvel" && <MarvelBackground />}
      {theme.id === "retro-90s" && <SynthwaveBackground />}
      {theme.id === "glass-3d" && <GlassBackground />}
    </View>
  );
}
