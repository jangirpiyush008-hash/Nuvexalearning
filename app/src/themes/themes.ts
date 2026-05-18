import type { Theme, ThemeId } from "./types";

// Palettes extracted from the 5 standalone design files (Matrix /
// Cartoon Premium / Ironman / Retro Modern / Liquid Glass). Multi-color
// per theme so screens read distinct.
export const THEMES: Record<ThemeId, Theme> = {
  // ─────────────────────────────────────────────────────────────────────────
  // MATRIX (neon-os) — terminal-green core, cyan + magenta + violet accents
  "neon-os": {
    id: "neon-os",
    name: "Matrix",
    tagline: "Wake up, Neo.",
    surface: "#000000",
    surfaceTint: "#001A0E",
    surfaceCard: "#0A0A0A",
    surfaceElevated: "#141414",
    border: "#1F2A1F",
    borderStrong: "#00FF8844",
    text: "#FFFFFF",
    textSubtle: "#A8FFB8",
    textMuted: "#6B7B6B",
    primary: "#00FF88",
    primarySoft: "#7CFFB2",
    onPrimary: "#000000",
    primaryGradient: ["#00FF88", "#00E5FF", "#00FF88", "#00A86B"],
    accent1: "#00E5FF",        // cyan
    accent2: "#FF3BE1",        // glitch magenta
    alertColor: "#FFD93D",     // yellow
    reward: "#6B3FFF",         // violet (special — different from primary)
    danger: "#FF3B5C",
    heroGradient: ["#00FF88", "#00E5FF", "#FF3BE1", "#000000"],
    cardRadius: 16,
    btnRadius: 12,
    displayWeight: "800",
    effects: { matrixRain: true, scanlines: true },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CARTOON PREMIUM — cream surface, dark-plum text, multi-color sticker palette
  cartoon: {
    id: "cartoon",
    name: "Cartoon Premium",
    tagline: "Bold lines. Bright colors. POW!",
    surface: "#FFF8F2",
    surfaceTint: "#FFE9CC",
    surfaceCard: "#FFFFFF",
    surfaceElevated: "#FFF1E2",
    border: "#2D2438",
    borderStrong: "#2D2438",
    text: "#2D2438",
    textSubtle: "#5D4D74",
    textMuted: "#8A7AA0",
    primary: "#FF5E94",        // hot pink
    primarySoft: "#FFA8C5",
    onPrimary: "#FFFFFF",
    primaryGradient: ["#FFD93D", "#FF8C42", "#FF5E94", "#4D96FF"],
    accent1: "#FFD93D",        // sticker yellow
    accent2: "#6BCB77",        // lime
    alertColor: "#4D96FF",     // happy blue
    reward: "#FFD93D",
    danger: "#FF4D6D",
    heroGradient: ["#FFD93D", "#FF8C42", "#FF5E94", "#4D96FF"],
    cardRadius: 24,
    btnRadius: 22,
    displayWeight: "900",
    slightTilt: true,
    effects: { comicBurst: true, comicDots: true },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // IRONMAN (marvel) — deep-navy hull + crimson + gold + cyan tech HUD
  marvel: {
    id: "marvel",
    name: "Ironman",
    tagline: "Tony's HUD. Tactical. Power on.",
    surface: "#0A0E1A",
    surfaceTint: "#050810",
    surfaceCard: "#1A2238",
    surfaceElevated: "#2A3050",
    border: "#3A4060",
    borderStrong: "#FFD700",
    text: "#FFFFFF",
    textSubtle: "#9FB3D9",
    textMuted: "#5F708A",
    primary: "#DC143C",        // ironman crimson
    primarySoft: "#FF6E89",
    onPrimary: "#FFFFFF",
    primaryGradient: ["#FFD700", "#FF6B35", "#DC143C", "#8B0000"],
    accent1: "#FFD700",        // gold
    accent2: "#00D9FF",        // arc-reactor cyan
    alertColor: "#FFD700",
    reward: "#FFD700",
    danger: "#FF3838",
    heroGradient: ["#FFD700", "#FF6B35", "#DC143C", "#0A0E1A"],
    cardRadius: 6,
    btnRadius: 4,
    displayWeight: "900",
    uppercase: true,
    italicHeadlines: true,
    effects: { marvelStreaks: true },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RETRO MODERN — synthwave / vaporwave. Magenta + cyan + purple over deep indigo
  "retro-90s": {
    id: "retro-90s",
    name: "Retro Modern",
    tagline: "Vaporwave. Neon horizon. 1986 forever.",
    surface: "#100E22",
    surfaceTint: "#1A1830",
    surfaceCard: "#1A1830",
    surfaceElevated: "#2A1F45",
    border: "#3A2A5A",
    borderStrong: "#FF3DC4",
    text: "#F5F1E8",
    textSubtle: "#C7BDE0",
    textMuted: "#7A6E96",
    primary: "#FF3DC4",        // vaporwave hot pink
    primarySoft: "#FFB3E5",
    onPrimary: "#FFFFFF",
    primaryGradient: ["#FFE066", "#FF3DC4", "#B84BFF", "#00D9FF"],
    accent1: "#00D9FF",        // cyan
    accent2: "#B84BFF",        // purple
    alertColor: "#FFE066",     // sun yellow
    reward: "#FFB627",
    danger: "#FF4D6D",
    heroGradient: ["#FFE066", "#FF3DC4", "#B84BFF", "#100E22"],
    cardRadius: 14,
    btnRadius: 10,
    displayWeight: "800",
    uppercase: true,
    effects: { synthwave: true },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LIQUID GLASS — pastel iridescent. Soft violet/pink/mint/amber over dark cosmos
  "glass-3d": {
    id: "glass-3d",
    name: "Liquid Glass",
    tagline: "Frosted. Iridescent. Floating.",
    surface: "#0A0A12",
    surfaceTint: "#050510",
    // Solid tinted dark cards — keeps "glass" feel via highlights/borders,
    // not by transparency (which made cards disappear on screen).
    surfaceCard: "#161624",
    surfaceElevated: "#1F1F30",
    border: "#3A3458",
    borderStrong: "#6055A8",
    text: "#FFFFFF",
    textSubtle: "#D8DEF0",
    textMuted: "#7F87A6",
    primary: "#A78BFA",        // pastel violet
    primarySoft: "#C7B7FB",
    onPrimary: "#0A0A12",
    primaryGradient: ["#86EFAC", "#38BDF8", "#A78BFA", "#F0ABFC"],
    accent1: "#F0ABFC",        // pastel pink
    accent2: "#86EFAC",        // pastel mint
    alertColor: "#FDE68A",     // pastel amber
    reward: "#FDE68A",
    danger: "#FB7185",
    heroGradient: ["#86EFAC", "#38BDF8", "#A78BFA", "#F0ABFC"],
    cardRadius: 22,
    btnRadius: 18,
    displayWeight: "700",
    effects: { glassBlur: true },
  },
};

export const THEME_ORDER: ThemeId[] = ["neon-os", "cartoon", "marvel", "retro-90s", "glass-3d"];
