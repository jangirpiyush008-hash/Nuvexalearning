import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

// Win95 desktop: teal background with diagonal hatch + iconic taskbar at bottom
// + window title-bar-style banner up top.
export function Win95Background() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: "#008080" }]}>
      {/* diagonal hatch pattern (subtle) */}
      <View style={StyleSheet.absoluteFill}>
        {Array.from({ length: 40 }).map((_, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              top: i * 30,
              left: -20,
              right: -20,
              height: 1,
              backgroundColor: "#006666",
              opacity: 0.4,
              transform: [{ rotateZ: "-12deg" }],
            }}
          />
        ))}
      </View>

      {/* fake taskbar at bottom (visual only, sits below content) */}
      <View style={styles.taskbar}>
        <View style={styles.startButton}>
          <View style={styles.startFlag} />
          <Text style={styles.startText}>Start</Text>
        </View>
        <View style={styles.taskbarSep} />
        <View style={styles.taskbarTab}>
          <Text style={styles.tabText}>📁 C:\NUVEXA</Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.systray}>
          <Text style={styles.systrayText}>11:55 AM</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  taskbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: "#C0C0C0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 2,
    borderTopWidth: 2,
    borderTopColor: "#FFFFFF",
    opacity: 0.55,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#C0C0C0",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: "#7F7F7F",
    borderRightColor: "#7F7F7F",
    marginRight: 4,
  },
  startFlag: {
    width: 12,
    height: 12,
    backgroundColor: "#0000AA",
    marginRight: 4,
  },
  startText: { fontFamily: "Courier", fontWeight: "700", fontSize: 11, color: "#000" },
  taskbarSep: { width: 1, height: 22, backgroundColor: "#7F7F7F", marginHorizontal: 2 },
  taskbarTab: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#C0C0C0",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: "#7F7F7F",
    borderLeftColor: "#7F7F7F",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
  },
  tabText: { fontFamily: "Courier", fontSize: 10, color: "#000" },
  systray: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: "#7F7F7F",
    borderLeftColor: "#7F7F7F",
  },
  systrayText: { fontFamily: "Courier", fontSize: 10, color: "#000" },
});
