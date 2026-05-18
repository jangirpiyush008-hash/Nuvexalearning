import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { SecureStorage } from "@/core/storage/secureStore";
import { THEMES } from "./themes";
import type { Theme, ThemeId } from "./types";

const STORAGE_KEY = "nuvexa.theme";
const DEFAULT_THEME: ThemeId = "neon-os";

type Ctx = {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => Promise<void>;
};

const ThemeCtx = createContext<Ctx>({
  theme: THEMES[DEFAULT_THEME],
  themeId: DEFAULT_THEME,
  setTheme: async () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    SecureStorage.get(STORAGE_KEY)
      .then((v) => {
        if (v && (v as ThemeId) in THEMES) {
          setThemeId(v as ThemeId);
        }
      })
      .catch(() => undefined);
  }, []);

  const setTheme = useCallback(async (id: ThemeId) => {
    setThemeId(id);
    try {
      await SecureStorage.set(STORAGE_KEY, id);
    } catch {
      /* swallow */
    }
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme: THEMES[themeId], themeId, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
