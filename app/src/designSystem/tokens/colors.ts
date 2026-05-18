// Nuvexa palette — locked from the standalone design file.
// "Black is canvas. White is text. Neon green is energy."
//
// SECONDARY: an Instagram-style warm gradient is layered in as accent.
// Used for: story rings, top-voice borders, social CTAs, "creator" UI.
// Rule of thumb — neon = ENERGY (action / win), insta = SOCIAL (people / status).
export const Colors = {
  // Surfaces — pure black canvas, subtle elevation ramp
  surface: "#000000",
  surfaceCard: "#0A0A0A",
  surfaceElevated: "#141414",
  surfaceHover: "#1C1C1C",
  border: "#2A2A2A",

  // Text
  text: "#FFFFFF",
  textSubtle: "#A1A1A1",
  textMuted: "#6B6B6B",
  textFaint: "#4A4A4A",

  // Neon primary — the energy
  neon: "#00FF88",
  neonBright: "#39FF6A",
  neonDeep: "#00CC6E",
  neonInk: "#00A86B",
  neonSoft: "#7CFFB2",

  // Instagram accent (warm gradient) — social/people surfaces
  igOrange: "#F58529",
  igPink: "#DD2A7B",
  igMagenta: "#8134AF",
  igViolet: "#515BD4",

  // Reward / verified / state
  verified: "#7CFFB2",
  reward: "#00FF88",
  rewardFlash: "#FFFFFF",
  trial: "#FFB020",
  warn: "#FFB020",
  danger: "#FF3B5C",

  // Text-on-neon — always black
  onNeon: "#000000",
} as const;

export const Gradients = {
  // PRIMARY (neon) — CTAs, hero, logo glow
  primary: ["#39FF6A", "#00FF88", "#00CC6E", "#00A86B"] as const,

  // REWARD (95%+ win) — neon → white flash
  reward: ["#00FF88", "#FFFFFF"] as const,

  // Soft glow stops behind logos / radial bleeds
  glowSoft: ["#00FF88AA", "#00FF8800"] as const,

  // Card subtle elevation
  cardLift: ["#141414", "#0A0A0A"] as const,

  // INSTAGRAM (secondary) — social surfaces, story rings, top voice
  insta: ["#F58529", "#DD2A7B", "#8134AF", "#515BD4"] as const,
  instaSoft: ["#F5852944", "#DD2A7B44", "#8134AF44", "#515BD444"] as const,
} as const;
