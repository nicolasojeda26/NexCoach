/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        volt: {
          DEFAULT: '#10f59b',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#10b981',
          600: '#059669',
          glow: '#00f59b',
          neon: '#10f59b'
        },
        cyber: {
          DEFAULT: '#00e5ff',
          400: '#38bdf8',
          500: '#0ea5e9',
          glow: '#00e5ff'
        },
        obsidian: {
          DEFAULT: '#04070e',
          card: '#090f1d',
          surface: '#0d1527',
          border: '#1e293b'
        },
        dark: {
          800: '#131c2e',
          850: '#0e1626',
          900: '#090f1d',
          950: '#04070e',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'volt-sm': '0 0 15px rgba(16, 245, 155, 0.25)',
        'volt-md': '0 0 25px rgba(16, 245, 155, 0.4)',
        'volt-lg': '0 0 40px rgba(16, 245, 155, 0.55)',
        'cyber-sm': '0 0 15px rgba(0, 229, 255, 0.25)',
        'inner-glow': 'inset 0 0 15px rgba(16, 245, 155, 0.1)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'float': 'float 4s infinite ease-in-out',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(16, 245, 155, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(16, 245, 155, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
