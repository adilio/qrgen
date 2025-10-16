/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#2563eb',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#2563eb',
          600: '#1d4ed8',
        },
        brand: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#5457e0',
        },
      },
      boxShadow: {
        panel: '0 12px 32px -20px rgba(15, 23, 42, 0.35)',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    forms({
      strategy: 'class',
    }),
  ],
}
