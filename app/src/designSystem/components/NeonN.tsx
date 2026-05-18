import React from "react";
import Svg, { Path } from "react-native-svg";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/themes/ThemeProvider";

// Stylized "N" brand mark. Fill color follows the active theme primary.
// Glow via wrapping View shadow.
export function NeonN({ size = 120, glow = true }: { size?: number; glow?: boolean }) {
  const { theme } = useTheme();
  const vb = 240;
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {glow && (
        <View
          style={[
            styles.glow,
            {
              width: size * 1.5,
              height: size * 1.5,
              borderRadius: size * 0.75,
              shadowColor: theme.primary,
              shadowRadius: size * 0.45,
            },
          ]}
        />
      )}
      <Svg width={size} height={size} viewBox={`-${vb / 2} -${vb / 2} ${vb} ${vb}`}>
        <Path
          d="M -90 120 L -90 -120 L -45 -120 L 65 105 L 65 -120 L 110 -120 L 110 120 L 65 120 L -45 -85 L -45 120 Z"
          fill={theme.primary}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  glow: {
    position: "absolute",
    backgroundColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
  },
});
