/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7b5cff',
          50: '#f2efff',
          100: '#e5e0ff',
          500: '#7b5cff',
          600: '#6240f5',
          700: '#4a2fd8',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.72)',
          dark: 'rgba(18, 21, 34, 0.68)',
        },
      },
      boxShadow: {
        glow: '0 18px 40px -24px rgba(123, 92, 255, 0.6)',
        inset: 'inset 0 1px 1px rgba(255,255,255,0.45)',
      },
      backgroundImage: {
        'accent-radial':
          'radial-gradient(circle at top left, rgba(123, 92, 255, 0.65), transparent 60%)',
        'accent-linear':
          'linear-gradient(135deg, rgba(123, 92, 255, 0.55), rgba(0, 216, 255, 0.45))',
      },
      fontFamily: {
        display: ['"SF Pro Display"', '"Helvetica Neue"', 'system-ui', 'sans-serif'],
      },
      dropShadow: {
        glass: '0 8px 24px rgba(15, 23, 42, 0.25)',
      },
    },
  },
  plugins: [
    forms({
      strategy: 'class',
    }),
  ],
}
