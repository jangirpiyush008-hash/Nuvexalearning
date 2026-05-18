import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { Typography } from "..";
import { useTheme } from "@/themes/ThemeProvider";

export function GradientProgressRing({
  percent,
  size = 64,
  stroke = 6,
  label,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const { theme } = useTheme();
  const clamped = Math.max(0, Math.min(100, percent));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const [s0, s1, s2, s3] = theme.primaryGradient;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id={`ringGrad-${theme.id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={s0} />
            <Stop offset="0.4" stopColor={s1} />
            <Stop offset="0.75" stopColor={s2} />
            <Stop offset="1" stopColor={s3} />
          </SvgGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#ringGrad-${theme.id})`}
          strokeWidth={stroke}
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[Typography.titleS, { color: theme.text }]}>{Math.round(clamped)}%</Text>
        {label ? <Text style={[Typography.caption, { color: theme.textMuted }]}>{label}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  center: { position: "absolute", alignItems: "center", justifyContent: "center" },
});
