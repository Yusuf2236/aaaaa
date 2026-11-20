/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#040711',
          900: '#080c14',
          850: '#0c1220',
          800: '#10172a',
          700: '#162038',
          600: '#1e2d4d',
          primary: '#00f0ff',
          neon: '#00ff88',
          danger: '#ff0055',
          warning: '#ffb703',
          purple: '#a855f7'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'cyber-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.25)',
        'cyber-neon': '0 0 25px -5px rgba(0, 255, 136, 0.25)',
        'cyber-danger': '0 0 25px -5px rgba(255, 0, 85, 0.25)',
        'cyber-purple': '0 0 25px -5px rgba(168, 85, 247, 0.25)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
