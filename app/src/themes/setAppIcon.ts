import { Platform } from "react-native";
import { setAppIcon } from "expo-dynamic-app-icon";
import type { ThemeId } from "./types";

// Theme ids → alternate-icon names declared in app.json's
// expo-dynamic-app-icon plugin config.
const ICON_MAP: Record<ThemeId, string> = {
  "neon-os":   "matrix",
  "cartoon":   "cartoon",
  "marvel":    "ironman",
  "retro-90s": "synthwave",
  "glass-3d":  "glass",
};

/**
 * Switch the iOS home-screen icon to match the active theme.
 *
 * - iOS only. No-ops on Android / simulator-default builds.
 * - Wrapped in try/catch so failures (sim, dev build, race conditions on
 *   first launch) never crash the theme switch — the in-app theme still
 *   applies even if the alt icon swap fails.
 * - Passing `DEFAULT` resets to the primary AppIcon.
 */
export async function setAppIconForTheme(themeId: ThemeId): Promise<void> {
  if (Platform.OS !== "ios") return;
  try {
    const target = ICON_MAP[themeId];
    if (!target) return;
    await setAppIcon(target);
  } catch {
    /* swallow — alt icons aren't critical to app function */
  }
}
