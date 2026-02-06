import type { Config } from "tailwindcss";
import { defaultTheme } from "./src/theme/colors";

const config: Config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    fontFamily: {
      sans: ["Inter_400Regular"],
    },
    extend: {
      colors: {
        // Primary
        "theme-primary": defaultTheme.primary.main,
        "theme-primary-light": defaultTheme.primary.light,
        "theme-primary-dark": defaultTheme.primary.dark,
        // Secondary
        "theme-secondary": defaultTheme.secondary.main,
        "theme-secondary-light": defaultTheme.secondary.light,
        "theme-secondary-dark": defaultTheme.secondary.dark,
        // Backgrounds
        "theme-background": defaultTheme.background.main,
        "theme-surface": defaultTheme.background.surface,
        "theme-elevated": defaultTheme.background.elevated,
        "theme-void": defaultTheme.background.main,
        // Text
        "theme-text-primary": defaultTheme.text.primary,
        "theme-text-secondary": defaultTheme.text.secondary,
        "theme-text-muted": defaultTheme.text.muted,
        // Status
        "theme-status-success": defaultTheme.status.success.main,
        "theme-status-success-light": defaultTheme.status.success.light,
        "theme-status-warning": defaultTheme.status.warning.main,
        "theme-status-warning-light": defaultTheme.status.warning.light,
        "theme-status-error": defaultTheme.status.error.main,
        "theme-status-error-light": defaultTheme.status.error.light,
        // Borders
        "theme-border": defaultTheme.border.main,
        "theme-border-light": defaultTheme.border.light,
        // Glass
        "theme-glass-border": "rgba(255, 255, 255, 0.08)",
        "theme-glass-bg": "rgba(17, 15, 29, 0.75)",
        "theme-glass-highlight": "rgba(139, 92, 246, 0.15)",
        "theme-glass-shine": "rgba(255, 255, 255, 0.03)",
      },
      fontFamily: {
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
      },
    },
  },
  plugins: [],
};

export default config;
