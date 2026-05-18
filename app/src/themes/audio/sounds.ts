import type { ThemeId } from "../types";

// Theme splash sounds — generated procedurally with ffmpeg sine synthesis.
// All 5 bundled at app/assets/sounds/. Total bundle add: ~63 KB.
//
// To swap your own: replace the mp3 at the same path, reload Metro.
// To go silent for a theme: set its slot to "".
export const THEME_SOUNDS: Record<ThemeId, string | number> = {
  "neon-os":   require("../../../assets/sounds/neon-os.mp3"),   // 2-tone terminal beep
  "cartoon":   require("../../../assets/sounds/cartoon.mp3"),    // sweep-up boing
  "marvel":    require("../../../assets/sounds/marvel.mp3"),     // sub-bass cinematic boom
  "retro-90s": require("../../../assets/sounds/retro-90s.mp3"),  // C-E-G-C ascending chime
  "glass-3d":  require("../../../assets/sounds/glass-3d.mp3"),   // bell shimmer with overtones
};
