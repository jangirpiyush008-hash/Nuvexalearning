// Theme type. Multi-color: every theme exposes a 3-color accent set (alert,
// secondary, tertiary) so screens aren't single-hue. Backgrounds are theme-
// specific (not all dark) so themes feel genuinely distinct.

export type ThemeEffects = {
  matrixRain?: boolean;   // Neon OS — falling green chars
  comicBurst?: boolean;   // Cartoon — halftone dots + POW stickers
  marvelStreaks?: boolean; // Marvel — diagonal action lines + grain
  win95Bevel?: boolean;   // Retro 90s — inset/outset border bevels
  glassBlur?: boolean;    // Glass 3D — BlurView frosted cards
  synthwave?: boolean;    // Retro Modern — perspective grid + magenta sun
  scanlines?: boolean;    // shared subtle overlay
  comicDots?: boolean;    // legacy alias
  pixelGrid?: boolean;    // legacy alias
};

export type ThemeId = "neon-os" | "cartoon" | "marvel" | "retro-90s" | "glass-3d";

export type Theme = {
  id: ThemeId;
  name: string;
  tagline: string;

  // Surfaces
  surface: string;
  surfaceTint?: string;    // for surface decoration / gradient
  surfaceCard: string;
  surfaceElevated: string;
  border: string;
  borderStrong?: string;   // strong border for Win95 / Cartoon outlines

  // Text
  text: string;
  textSubtle: string;
  textMuted: string;

  // Brand (primary)
  primary: string;
  primarySoft: string;
  onPrimary: string;
  primaryGradient: readonly [string, string, string, string];

  // Multi-color accents
  accent1: string;    // secondary highlight
  accent2: string;    // tertiary highlight (used sparingly)
  alertColor: string; // warnings / "new!" badges (not error)

  reward: string;
  danger: string;

  // Hero gradient
  heroGradient: readonly [string, string, string, string];

  // Shape
  cardRadius: number;
  btnRadius: number;

  // Type
  displayWeight: "700" | "800" | "900";
  monoFamily?: string;
  uppercase?: boolean;
  italicHeadlines?: boolean;
  slightTilt?: boolean;   // Cartoon — slight rotation on titles

  // Decoration
  effects: ThemeEffects;
};
