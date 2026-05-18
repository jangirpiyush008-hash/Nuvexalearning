import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const CHARS = "01ABCDEF<>/_\\@#%${}∆Ω∑¥".split("");
const COLUMNS = 16;
const COL_WIDTH = width / COLUMNS;

type ColProps = { left: number; delay: number; speed: number };

function Column({ left, delay, speed }: ColProps) {
  const y = useSharedValue(-height);

  useEffect(() => {
    y.value = withRepeat(
      withTiming(height + 200, { duration: speed, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  // pre-roll the chars on mount; static array
  const chars = React.useMemo(
    () => Array.from({ length: 22 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]),
    [],
  );

  return (
    <Animated.View style={[styles.col, { left, marginTop: delay }, style]}>
      {chars.map((c, i) => (
        <Text
          key={i}
          style={[
            styles.char,
            {
              opacity: 1 - i / 22,
              color: i === 0 ? "#FFFFFF" : "#00FF88",
              textShadowColor: "#00FF88",
              textShadowRadius: i === 0 ? 8 : 4,
            },
          ]}
        >
          {c}
        </Text>
      ))}
    </Animated.View>
  );
}

export function MatrixRain() {
  const cols = React.useMemo(
    () =>
      Array.from({ length: COLUMNS }, (_, i) => ({
        left: i * COL_WIDTH,
        delay: -Math.floor(Math.random() * 600),
        speed: 6000 + Math.floor(Math.random() * 5000),
      })),
    [],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {cols.map((c, i) => (
        <Column key={i} {...c} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  col: {
    position: "absolute",
    top: 0,
    width: COL_WIDTH,
    alignItems: "center",
  },
  char: {
    fontSize: 12,
    fontFamily: "Menlo",
    fontWeight: "600",
    lineHeight: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
});
