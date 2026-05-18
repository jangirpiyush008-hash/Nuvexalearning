import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// Synthwave / vaporwave background:
// - Deep indigo top → magenta sunset → indigo bottom
// - Soft cyan sun disc on horizon (~55% down screen)
// - Perspective grid below the horizon, lines converging to vanishing point
export function SynthwaveBackground() {
  const HORIZON_Y = height * 0.55;
  const VANISH_X = width / 2;

  const horizontalLines = 12;
  const verticalLines = 18;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* sky gradient — indigo to magenta sunset */}
      <LinearGradient
        colors={["#100E22", "#2A1F45", "#FF3DC4", "#FFE066"]}
        locations={[0, 0.35, 0.55, 0.62]}
        style={[StyleSheet.absoluteFillObject, { height: HORIZON_Y + 40 }]}
      />
      {/* below horizon — deep indigo */}
      <View
        style={{
          position: "absolute",
          top: HORIZON_Y,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#100E22",
        }}
      />
      {/* soft cyan + magenta sun disc */}
      <View
        style={{
          position: "absolute",
          top: HORIZON_Y - 90,
          left: width / 2 - 80,
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: "#FFE066",
          opacity: 0.75,
          shadowColor: "#FF3DC4",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.85,
          shadowRadius: 60,
        }}
      />
      {/* sun horizon-cut lines (the iconic "slashed sun" look) */}
      {Array.from({ length: 4 }).map((_, i) => (
        <View
          key={`sun-line-${i}`}
          style={{
            position: "absolute",
            top: HORIZON_Y - 30 + i * 10,
            left: width / 2 - 80,
            width: 160,
            height: 2,
            backgroundColor: "#100E22",
            opacity: 0.85,
          }}
        />
      ))}

      {/* perspective grid below horizon */}
      <View
        style={{
          position: "absolute",
          top: HORIZON_Y,
          left: 0,
          right: 0,
          height: height - HORIZON_Y,
          overflow: "hidden",
        }}
        pointerEvents="none"
      >
        {/* horizontal lines — fewer near horizon, denser near viewer */}
        {Array.from({ length: horizontalLines }).map((_, i) => {
          // pow scale: lines compress near horizon, stretch near bottom
          const t = Math.pow(i / (horizontalLines - 1), 2.4);
          const y = t * (height - HORIZON_Y);
          return (
            <View
              key={`h-${i}`}
              style={{
                position: "absolute",
                top: y,
                left: 0,
                right: 0,
                height: 1.5,
                backgroundColor: "#FF3DC4",
                opacity: 0.55 - 0.25 * (1 - t),
                shadowColor: "#FF3DC4",
                shadowOpacity: 0.55,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 0 },
              }}
            />
          );
        })}
        {/* vertical lines converging to vanishing point */}
        {Array.from({ length: verticalLines + 1 }).map((_, i) => {
          const x0 = (i / verticalLines) * width;
          // line goes from (x0, height - HORIZON_Y) bottom → vanish (VANISH_X, 0) top
          // we draw as a thin rotated View
          const dx = VANISH_X - x0;
          const dy = -(height - HORIZON_Y);
          const len = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          return (
            <View
              key={`v-${i}`}
              style={{
                position: "absolute",
                left: x0,
                top: height - HORIZON_Y,
                width: len,
                height: 1.5,
                backgroundColor: "#00D9FF",
                opacity: 0.5,
                shadowColor: "#00D9FF",
                shadowOpacity: 0.5,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 0 },
                transform: [
                  { translateY: 0 },
                  { rotateZ: `${angle}deg` },
                  { translateX: 0 },
                ],
                transformOrigin: "left center" as any,
              }}
            />
          );
        })}
      </View>

      {/* faint star scatter above horizon */}
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: HORIZON_Y * 0.5 }}
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <View
            key={`star-${i}`}
            style={{
              position: "absolute",
              top: (i * 37) % HORIZON_Y * 0.5,
              left: (i * 53) % width,
              width: 1.5,
              height: 1.5,
              borderRadius: 1,
              backgroundColor: "#FFFFFF",
              opacity: 0.35,
            }}
          />
        ))}
      </View>
    </View>
  );
}
