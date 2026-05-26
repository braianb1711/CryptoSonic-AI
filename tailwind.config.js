/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#0a0e17',
          800: '#111827',
          700: '#1a2332',
          600: '#243044',
        },
        accent: {
          cyan: '#22d3ee',
          green: '#10b981',
          red: '#ef4444',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(34, 211, 238, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
};
