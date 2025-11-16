/** @type {import('tailwindcss').Config} */
module.exports = {
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
        'theme-primary': '#9333ea', // purple-600
        'theme-primary-light': '#a855f7', // purple-500
        'theme-primary-dark': '#7e22ce', // purple-700
        'theme-secondary': '#eab308', // yellow-500
        'theme-secondary-light': '#facc15', // yellow-400
        'theme-secondary-dark': '#ca8a04', // yellow-600
        'theme-background': '#f9fafb', // gray-50
        'theme-surface': '#ffffff', // white
        'theme-surface-soft': '#fafafa', // soft white
        'theme-text-primary': '#111827', // gray-900
        'theme-text-secondary': '#4b5563', // gray-600
        'theme-text-muted': '#9ca3af', // gray-400
        'theme-status-success': '#16a34a', // green-600
        'theme-status-success-light': '#dcfce7', // green-100
        'theme-status-warning': '#ca8a04', // yellow-600
        'theme-status-warning-light': '#fef9c3', // yellow-100
        'theme-status-error': '#dc2626', // red-600
        'theme-status-error-light': '#fee2e2', // red-100
        'theme-border': '#e5e7eb', // gray-200
        'theme-border-light': '#f3f4f6', // gray-100
      },
      fontFamily: {
        'sans-medium': ['Inter_500Medium'],
        'sans-semibold': ['Inter_600SemiBold'],
        'sans-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
}

