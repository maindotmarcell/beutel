import { create } from "zustand";
import { Theme, darkTheme } from "@/theme/colors";

interface ThemeStore {
  // State
  theme: Theme;

  // Actions
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  // Initial state — liquid glass dark theme
  theme: darkTheme,

  // Actions
  setTheme: (theme: Theme) => {
    set({ theme });
  },
}));

// Convenience hook for API compatibility
export function useTheme(): Theme {
  return useThemeStore((state) => state.theme);
}
