import { Audio } from "expo-av";
import { THEME_SOUNDS } from "./sounds";
import type { ThemeId } from "../types";

let active: Audio.Sound | null = null;

// Plays the splash sound for the active theme. Safe — missing files / network
// errors / blank URIs silently no-op so the app never crashes on cold start.
export async function playSplashSoundFor(themeId: ThemeId): Promise<void> {
  const uri = THEME_SOUNDS[themeId];
  if (!uri || uri === "") return;

  try {
    // Allow playback in iOS silent mode (otherwise nothing comes out)
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Tear down previous sound if any
    if (active) {
      await active.unloadAsync().catch(() => undefined);
      active = null;
    }

    const source = typeof uri === "string" ? { uri } : (uri as number);
    const { sound } = await Audio.Sound.createAsync(source, {
      shouldPlay: true,
      volume: 0.6,
      isLooping: false,
    });
    active = sound;

    // Auto-cleanup once playback finishes
    sound.setOnPlaybackStatusUpdate((status) => {
      if ("didJustFinish" in status && status.didJustFinish) {
        sound.unloadAsync().catch(() => undefined);
        if (active === sound) active = null;
      }
    });
  } catch {
    // swallow — sound is non-critical
  }
}

export async function stopSplashSound(): Promise<void> {
  try {
    if (active) {
      await active.unloadAsync().catch(() => undefined);
      active = null;
    }
  } catch {
    /* swallow */
  }
}
