import { TextStyle, Platform } from "react-native";

const MONO = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });

export const Typography = {
  displayXL: { fontSize: 40, fontWeight: "800", letterSpacing: -0.6, lineHeight: 46 } as TextStyle,
  displayL:  { fontSize: 32, fontWeight: "800", letterSpacing: -0.5, lineHeight: 38 } as TextStyle,
  titleL:    { fontSize: 24, fontWeight: "700", letterSpacing: -0.3, lineHeight: 30 } as TextStyle,
  titleM:    { fontSize: 20, fontWeight: "700", letterSpacing: -0.2, lineHeight: 26 } as TextStyle,
  titleS:    { fontSize: 17, fontWeight: "700", lineHeight: 22 } as TextStyle,
  bodyL:     { fontSize: 17, fontWeight: "400", lineHeight: 24 } as TextStyle,
  body:      { fontSize: 15, fontWeight: "400", lineHeight: 22 } as TextStyle,
  bodyS:     { fontSize: 13, fontWeight: "400", lineHeight: 18 } as TextStyle,
  caption:   { fontSize: 12, fontWeight: "500", lineHeight: 16, letterSpacing: 0.2 } as TextStyle,

  // Terminal — `$ TERMINAL_OVERLINE`, hex values, mono accents
  terminal:  { fontSize: 11, fontWeight: "800", letterSpacing: 1.8, fontFamily: MONO } as TextStyle,
  mono:      { fontSize: 12, fontWeight: "500", fontFamily: MONO } as TextStyle,
} as const;
