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
    extend: {
      colors: {
        'theme-primary': '#f97316', // orange-500
        'theme-primary-light': '#fb923c', // orange-400
        'theme-primary-dark': '#ea580c', // orange-600
        'theme-secondary': '#6b7280', // gray-500
        'theme-secondary-light': '#9ca3af', // gray-400
        'theme-secondary-dark': '#4b5563', // gray-600
        'theme-background': '#f9fafb', // gray-50
        'theme-surface': '#ffffff', // white
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
    },
  },
  plugins: [],
}

