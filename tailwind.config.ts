import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        zinc: {
          925: '#111114',
          950: '#0a0a0f',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  safelist: [
    // top borders
    'border-t-2',
    'border-t-blue-500', 'border-t-violet-500', 'border-t-emerald-500',
    'border-t-amber-500', 'border-t-rose-500', 'border-t-cyan-500',
    // text colours
    'text-blue-600', 'dark:text-blue-400',
    'text-violet-600', 'dark:text-violet-400',
    'text-emerald-600', 'dark:text-emerald-400',
    'text-amber-600', 'dark:text-amber-400',
    'text-rose-600', 'dark:text-rose-400',
    'text-cyan-600', 'dark:text-cyan-400',
    // legacy (kept for any cached builds)
    'text-blue-400', 'text-violet-400', 'text-emerald-400',
    'text-amber-400', 'text-rose-400', 'text-cyan-400',
  ],
  plugins: [],
};

export default config;
