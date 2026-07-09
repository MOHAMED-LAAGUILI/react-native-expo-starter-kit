import { create } from "zustand";
import { STORAGE_KEYS } from "@/config/constants";
import { StorageService } from "@/storage";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  primaryColor: string;
  setMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: string) => void;
  hydrate: () => void;
}

function loadMode(): ThemeMode {
  try {
    const v = StorageService.theme.getItem<string>(STORAGE_KEYS.THEME_MODE);
    if (v && ["light", "dark", "system"].includes(v)) return v as ThemeMode;
  } catch {}
  return "system";
}

function loadPrimaryColor(): string {
  try {
    const v = StorageService.theme.getItem<string>(STORAGE_KEYS.PRIMARY_COLOR);
    if (v) return v;
  } catch {}
  return "blue";
}

export const useThemeStore = create<ThemeState>(set => ({
  hydrate: () => {
    try {
      const mode = loadMode();
      set({ mode });
      const color = loadPrimaryColor();
      set({ primaryColor: color });
    } catch {}
  },
  mode: loadMode(),
  primaryColor: loadPrimaryColor(),

  setMode: (mode: ThemeMode) => {
    StorageService.theme.setItem(STORAGE_KEYS.THEME_MODE, mode);
    set({ mode });
  },

  setPrimaryColor: (color: string) => {
    StorageService.theme.setItem(STORAGE_KEYS.PRIMARY_COLOR, color);
    set({ primaryColor: color });
  },
}));
