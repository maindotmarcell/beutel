import type { Config } from 'tailwindcss';
import { defaultTheme } from './theme/colors';

const config: Config = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require('nativewind/preset')],
  theme: {
    fontFamily: {
      sans: ['Inter_400Regular'],
    },
    extend: {
      colors: {
        'theme-primary': defaultTheme.primary.main,
        'theme-primary-light': defaultTheme.primary.light,
        'theme-primary-dark': defaultTheme.primary.dark,
        'theme-secondary': defaultTheme.secondary.main, // #E0F003 - Neon Lime Yellow
        'theme-secondary-light': defaultTheme.secondary.light,
        'theme-secondary-dark': defaultTheme.secondary.dark,
        'theme-background': defaultTheme.background.main,
        'theme-surface': defaultTheme.background.surface,
        'theme-surface-soft': '#fafafa', // soft white
        'theme-text-primary': defaultTheme.text.primary,
        'theme-text-secondary': defaultTheme.text.secondary,
        'theme-text-muted': defaultTheme.text.muted,
        'theme-status-success': defaultTheme.status.success.main,
        'theme-status-success-light': defaultTheme.status.success.light,
        'theme-status-warning': defaultTheme.status.warning.main,
        'theme-status-warning-light': defaultTheme.status.warning.light,
        'theme-status-error': defaultTheme.status.error.main,
        'theme-status-error-light': defaultTheme.status.error.light,
        'theme-border': defaultTheme.border.main,
        'theme-border-light': defaultTheme.border.light,
      },
      fontFamily: {
        'sans-medium': ['Inter_500Medium'],
        'sans-semibold': ['Inter_600SemiBold'],
        'sans-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};

export default config;

