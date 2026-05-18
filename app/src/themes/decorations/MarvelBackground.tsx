import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// Marvel cinematic background: deep red gradient + diagonal action streaks +
// film-grain dot pattern.
export function MarvelBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Vertical color bleed */}
      <LinearGradient
        colors={["#3A0A0F", "#1A0608", "#0A0204"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top corner gold flare */}
      <LinearGradient
        colors={["#FFB40044", "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { opacity: 0.5 }]}
      />

      {/* Diagonal action streaks */}
      <View style={[StyleSheet.absoluteFill, { transform: [{ rotateZ: "-12deg" }] }]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              top: `${i * 13 + 5}%` as any,
              left: "-40%",
              right: "-40%",
              height: i % 2 === 0 ? 2 : 1,
              backgroundColor: i % 3 === 0 ? "#FFB400" : "#E62429",
              opacity: 0.18,
            }}
          />
        ))}
      </View>

      {/* Film grain dot scatter */}
      <View style={StyleSheet.absoluteFill}>
        {Array.from({ length: 30 }).flatMap((_, row) =>
          Array.from({ length: 14 }).map((_, col) => (
            <View
              key={`${row}-${col}`}
              style={{
                position: "absolute",
                top: `${(row * 100) / 30}%` as any,
                left: `${(col * 100) / 14}%` as any,
                width: 1.5,
                height: 1.5,
                backgroundColor: "#FFFFFF",
                opacity: (row + col) % 3 === 0 ? 0.04 : 0,
              }}
            />
          )),
        )}
      </View>
    </View>
  );
}
