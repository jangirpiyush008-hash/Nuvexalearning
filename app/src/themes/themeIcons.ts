import type { ThemeId } from "./types";

// Per-theme icon PNGs (generated procedurally). Static require()s — RN bundler
// needs literal paths so we map each theme id here.
//
// Currently used as the in-app preview in the ThemeApplyModal + Profile
// Appearance row. When iOS alternate-icons gets wired, these same PNGs feed
// into the alt-icon asset catalog.
export const THEME_ICONS: Record<ThemeId, number> = {
  "neon-os":   require("../../assets/icons/neon-os.png"),
  "cartoon":   require("../../assets/icons/cartoon.png"),
  "marvel":    require("../../assets/icons/marvel.png"),
  "retro-90s": require("../../assets/icons/retro-90s.png"),
  "glass-3d":  require("../../assets/icons/glass-3d.png"),
};
