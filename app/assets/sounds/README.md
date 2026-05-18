# Theme splash sounds

Drop 5 short mp3 files here (one per theme) and the splash will play the right one based on the active theme.

| Filename | Theme | Vibe |
|---|---|---|
| `neon-os.mp3`   | Neon OS    | terminal beep / data stream / synth pulse |
| `cartoon.mp3`   | Cartoon Pop | playful boing / pop / cartoon stinger |
| `marvel.mp3`    | Marvel     | cinematic boom / orchestral hit / impact |
| `retro-90s.mp3` | Retro 90s  | Windows-95-style startup chime |
| `glass-3d.mp3`  | Liquid Glass | glassy chime / shimmer / crystal tap |

**Keep them short** — under 1.5 seconds. Splash fades out at ~2.8s.

## After dropping files

Edit `src/themes/audio/sounds.ts`:

```ts
export const THEME_SOUNDS: Record<ThemeId, number | string> = {
  "neon-os":   require("../../../assets/sounds/neon-os.mp3"),
  "cartoon":   require("../../../assets/sounds/cartoon.mp3"),
  "marvel":    require("../../../assets/sounds/marvel.mp3"),
  "retro-90s": require("../../../assets/sounds/retro-90s.mp3"),
  "glass-3d":  require("../../../assets/sounds/glass-3d.mp3"),
};
```

Reload Metro. Done.

## OR use a remote URL

If you don't want to bundle files, paste a public mp3 URL (e.g. from Pixabay or Mixkit) into each slot of `THEME_SOUNDS`. Works without any rebuild.

## Free sources

- **Pixabay**: <https://pixabay.com/sound-effects/> (right-click → copy mp3 URL)
- **Mixkit**: <https://mixkit.co/free-sound-effects/>
- **Freesound**: <https://freesound.org/> (CC-licensed)

## Important

- `playsInSilentModeIOS` is already on, so the sound plays even with the silent switch
- Missing file / blank URI = silent no-op (won't crash)
- Sound is only played once on cold-start splash (not on theme switch — switching themes doesn't replay the splash)
