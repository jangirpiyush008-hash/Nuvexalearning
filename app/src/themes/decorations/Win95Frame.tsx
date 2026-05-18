import React, { ReactNode } from "react";
import { View, ViewStyle, StyleSheet } from "react-native";

// Authentic Win95 beveled panel: top + left light, bottom + right dark.
// Use as a wrapper for any "panel" feel in Retro 90s theme.
export function Win95Frame({
  children,
  style,
  inset = false,
}: {
  children: ReactNode;
  style?: ViewStyle;
  inset?: boolean;
}) {
  const outer = inset
    ? { topColor: "#7F7F7F", leftColor: "#7F7F7F", bottomColor: "#FFFFFF", rightColor: "#FFFFFF" }
    : { topColor: "#FFFFFF", leftColor: "#FFFFFF", bottomColor: "#7F7F7F", rightColor: "#7F7F7F" };

  return (
    <View
      style={[
        styles.outer,
        {
          borderTopColor: outer.topColor,
          borderLeftColor: outer.leftColor,
          borderBottomColor: outer.bottomColor,
          borderRightColor: outer.rightColor,
        },
        style,
      ]}
    >
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    backgroundColor: "#C0C0C0",
  },
  inner: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: "#DFDFDF",
    borderLeftColor: "#DFDFDF",
    borderBottomColor: "#000000",
    borderRightColor: "#000000",
  },
});
