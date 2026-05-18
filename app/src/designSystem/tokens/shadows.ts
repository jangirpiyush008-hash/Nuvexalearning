import { ViewStyle } from "react-native";

export const Shadows = {
  // Subtle card lift
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 6,
  } as ViewStyle,

  // Neon glow — used on hero CTA, logo, reward strip
  glow: {
    shadowColor: "#00FF88",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 12,
  } as ViewStyle,

  // Reward "flash" — softer, hot center
  reward: {
    shadowColor: "#00FF88",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 32,
    elevation: 14,
  } as ViewStyle,
} as const;
