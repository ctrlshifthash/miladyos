import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#09080c',
        surface: '#0d0b13',
        's2': '#131020',
        's3': '#1a1728',
        's4': '#242133',
        pink: {
          DEFAULT: '#f2a7c3',
          deep: '#c46888',
          dim: '#7a3a55',
          muted: 'rgba(242, 167, 195, 0.08)',
          border: 'rgba(242, 167, 195, 0.18)',
        },
        lavender: '#b09fc0',
        cream: '#ede8ec',
        ink: '#ede8ec',
        'ink-2': '#a09aa8',
        'ink-3': '#5a5462',
        'ink-4': '#2e2b36',
        line: 'rgba(255, 255, 255, 0.05)',
        'line-2': 'rgba(255, 255, 255, 0.08)',
        'line-3': 'rgba(255, 255, 255, 0.13)',
        'line-pink': 'rgba(242, 167, 195, 0.14)',
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'Menlo', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease forwards',
        'pulse-slow': 'pulse 5s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
