import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Cartoon Pop background: heavy halftone dots + scattered POW! WIN! ZAP! stickers.
// Static — no animation needed, the burst stickers are the energy.
export function ComicBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* halftone dot pattern */}
      <View style={StyleSheet.absoluteFill}>
        {Array.from({ length: 26 }).flatMap((_, row) =>
          Array.from({ length: 16 }).map((_, col) => (
            <View
              key={`${row}-${col}`}
              style={{
                position: "absolute",
                top: `${(row * 100) / 26}%` as any,
                left: `${(col * 100) / 16}%` as any,
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: "#1A1A1A",
                opacity: row % 2 === col % 2 ? 0.08 : 0,
              }}
            />
          )),
        )}
      </View>

      {/* big POW! burst top-right */}
      <View style={[styles.burst, { top: 60, right: -10, transform: [{ rotate: "12deg" }] }]}>
        <View style={[styles.burstShape, { backgroundColor: "#FFE600", borderColor: "#000" }]} />
        <Text style={styles.burstText}>POW!</Text>
      </View>

      {/* small WIN! bottom-left */}
      <View style={[styles.burstSm, { bottom: 120, left: -8, transform: [{ rotate: "-8deg" }] }]}>
        <View style={[styles.burstShapeSm, { backgroundColor: "#FF1493", borderColor: "#000" }]} />
        <Text style={styles.burstTextSm}>WIN!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  burst: {
    position: "absolute",
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  burstShape: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    opacity: 0.16,
  },
  burstText: {
    fontWeight: "900",
    fontSize: 24,
    color: "#0F0F0F",
    opacity: 0.22,
    textShadowColor: "#000",
    textShadowRadius: 0,
    textShadowOffset: { width: 2, height: 2 },
  },
  burstSm: {
    position: "absolute",
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  burstShapeSm: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    opacity: 0.16,
  },
  burstTextSm: {
    fontWeight: "900",
    fontSize: 18,
    color: "#FFFFFF",
    opacity: 0.85,
    textShadowColor: "#000",
    textShadowRadius: 0,
    textShadowOffset: { width: 1.5, height: 1.5 },
  },
});
